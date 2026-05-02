import { Controller, Get, Param } from '@nestjs/common'; // 🌟 เติม Param ตรงนี้ครับ
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('/api/bonus')
export class BonusController {
  @Get('/getBonus')
  async getBonus() {
    try {
      const res = await axios.get('https://lotto.api.rayriffy.com/latest');
      const data = res.data.response;
      const bonusDate = data.date; // "16 เมษายน 2569"

      // 🌟 1. เช็คก่อนว่ามีข้อมูลของงวดนี้ในระบบหรือยัง (ดักกดซ้ำ)
      const row = await prisma.bonusResultDetail.findMany({
        where: {
          bonusDate: bonusDate,
        },
      });

      if (row.length > 0) {
        return {
          status: 'success',
          date: bonusDate,
          message: 'ข้อมูลของงวดนี้ถูกอัปเดตในระบบเรียบร้อยแล้ว (ไม่บันทึกซ้ำ)',
          //raw_data: data, // 📦 ส่งข้อมูลดิบแบบเต็มๆ กลับไปให้ด้วย
        };
      }

      // =======================================================
      // 🌟 2. โค้ดส่วนดึงและบันทึกข้อมูล (ทำงานเมื่อยังไม่มีข้อมูล)
      // =======================================================
      const insertData: { number: string; price: number; bonusDate: string }[] =
        [];

      // 🔥 วนลูปเก็บ "รางวัลหลัก" ทั้งหมด (ที่ 1 ถึง 5 และรางวัลข้างเคียง)
      data.prizes.forEach((prizeGroup) => {
        const reward = Number(prizeGroup.reward); // ดึงยอดเงินของกลุ่มนั้นๆ
        prizeGroup.number.forEach((num) => {
          insertData.push({
            number: num,
            price: reward,
            bonusDate: bonusDate,
          });
        });
      });

      // 🔥 วนลูปเก็บ "รางวัลเลขหน้า/ท้าย" ทั้งหมด (หน้า 3, ท้าย 3, ท้าย 2)
      data.runningNumbers.forEach((runGroup) => {
        const reward = Number(runGroup.reward);
        runGroup.number.forEach((num) => {
          insertData.push({
            number: num,
            price: reward,
            bonusDate: bonusDate,
          });
        });
      });

      // 🌟 3. บันทึกลงฐานข้อมูลรวดเดียวจบ (จะได้ข้อมูลประมาณ 173 แถวต่องวด)
      await prisma.bonusResultDetail.createMany({
        data: insertData,
      });

      // 🌟 4. จัดแพ็กเกจส่งไปให้หน้า React (ส่งให้ครบทุกหมวด)
      return {
        status: 'success',
        date: bonusDate,
        message: `บันทึกข้อมูลสลากและเงินรางวัลจำนวน ${insertData.length} รายการเรียบร้อยแล้ว`,
        lotto_result: {
          prize1: data.prizes[0].number[0], // รางวัลที่ 1 (1 รางวัล)
          prize1Near: data.prizes[1].number, // ข้างเคียง (2 รางวัล)
          prize2: data.prizes[2].number, // รางวัลที่ 2 (5 รางวัล)
          prize3: data.prizes[3].number, // รางวัลที่ 3 (10 รางวัล)
          prize4: data.prizes[4].number, // รางวัลที่ 4 (50 รางวัล)
          prize5: data.prizes[5].number, // รางวัลที่ 5 (100 รางวัล)
          front3: data.runningNumbers[0].number, // หน้า 3 ตัว (2 รางวัล)
          back3: data.runningNumbers[1].number, // ท้าย 3 ตัว (2 รางวัล)
          back2: data.runningNumbers[2].number[0], // ท้าย 2 ตัว (1 รางวัล)
        },
        //raw_data: data, // 📦 ส่งข้อมูลดิบแบบเต็มๆ กลับไปให้ด้วย
      };
    } catch (e: any) {
      // 🌟 เติม : any ตรงนี้ครับ เส้นแดงจะหายวับไปทันที
      console.error('🔥 API Error:', e.message);
      return {
        status: 'error',
        message: 'ไม่สามารถดึงข้อมูลและบันทึกสลากได้',
        detail: e.message,
      };
    }
  }

  @Get('/list')
  async list() {
    try {
      const res = await prisma.bonusResultDetail.groupBy({
        by: ['bonusDate'],
        orderBy: { bonusDate: 'desc' },
      });

      return { results: res };
    } catch (e: any) {
      return {
        status: 'error',
        message: 'ไม่สามารถดึงข้อมูลและบันทึกสลากได้',
        detail: e.message,
      };
    }
  }

  @Get('/listDetail/:bonusDate')
  async listDetail(@Param('bonusDate') bonusDate: string) {
    try {
      const res = await prisma.bonusResultDetail.findMany({
        where: {
          bonusDate: bonusDate,
        },
        orderBy: { price: 'desc' },
      });
      return { results: res };
    } catch (e: any) {
      return {
        status: 'error',
        message: 'ไม่สามารถดึงข้อมูลและบันทึกสลากได้',
        detail: e.message,
      };
    }
  }

  @Get('/checkBonus')
  async checkBonus() {
    try {
      const billSaleDetails = await prisma.billSaleDetail.findMany({
        include: {
          lotto: true,
        },
        where: {},
      });

      const lastResult = await prisma.bonusResultDetail.findFirst({
        orderBy: {
          bonusDate: 'desc',
        },
      });

      const bonusResultDetails = await prisma.bonusResultDetail.findMany({
        where: {
          bonusDate: lastResult?.bonusDate,
        },
      });

      for (let i = 0; i < billSaleDetails.length; i++) {
        const item = billSaleDetails[i];

        for (let j = 0; j < bonusResultDetails.length; j++) {
          const item2 = bonusResultDetails[j];

          if (item.lotto.numbers === item2.number) {
            console.log('lucky', item2.price);
          }
        }
      }

      return { results: bonusResultDetails };
    } catch (e: any) {
      return {
        status: 'error',
        message: 'ไม่สามารถดึงข้อมูลและบันทึกสลากได้',
        detail: e.message,
      };
    }
  }
}
