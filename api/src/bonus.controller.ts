import { Controller, Get, Param } from '@nestjs/common';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🌟 ฟังก์ชันแปลงวันที่ภาษาไทยเป็น Date Object สำหรับฐานข้อมูล
function parseThaiDate(thaiDateStr: string): Date {
  const months = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];
  const parts = thaiDateStr.trim().split(' ');

  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthIndex = months.indexOf(parts[1]);
    const year = parseInt(parts[2], 10) - 543; // แปลง พ.ศ. เป็น ค.ศ.
    return new Date(Date.UTC(year, monthIndex, day));
  }
  return new Date(); // กันเหนียว
}

@Controller('/api/bonus')
export class BonusController {
  @Get('/getBonus')
  async getBonus() {
    try {
      const res = await axios.get('https://lotto.api.rayriffy.com/latest');
      const data = res.data.response;
      const bonusDate = data.date; // "16 เมษายน 2569"

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
        };
      }

      const insertData: { number: string; price: number; bonusDate: string }[] =
        [];

      data.prizes.forEach((prizeGroup) => {
        const reward = Number(prizeGroup.reward);
        prizeGroup.number.forEach((num) => {
          insertData.push({
            number: num,
            price: reward,
            bonusDate: bonusDate,
          });
        });
      });

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

      await prisma.bonusResultDetail.createMany({
        data: insertData,
      });

      return {
        status: 'success',
        date: bonusDate,
        message: `บันทึกข้อมูลสลากและเงินรางวัลจำนวน ${insertData.length} รายการเรียบร้อยแล้ว`,
        lotto_result: {
          prize1: data.prizes[0].number[0],
          prize1Near: data.prizes[1].number,
          prize2: data.prizes[2].number,
          prize3: data.prizes[3].number,
          prize4: data.prizes[4].number,
          prize5: data.prizes[5].number,
          front3: data.runningNumbers[0].number,
          back3: data.runningNumbers[1].number,
          back2: data.runningNumbers[2].number[0],
        },
      };
    } catch (e: any) {
      // ดึงรายละเอียด Error ออกมาให้ลึกขึ้น ถ้าฝั่งนู้นแนบมาให้
      const errorDetail = e.response?.data || e.message;

      console.error('🔥 API Error:', errorDetail);

      return {
        status: 'error',
        message: 'ไม่สามารถดึงข้อมูลและบันทึกสลากได้ (API ต้นทางอาจมีปัญหา)',
        detail: errorDetail,
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
        where: {
          // 🌟 เช็คแค่เงื่อนไขเดียว: "บิลนี้ลูกค้าโอนเงินหรือยัง?"
          billSale: {
            payDate: {
              not: null,
            },
            // ❌ ลบเงื่อนไข customerAddress ออกไปแล้วครับ! ว่างก็ตรวจให้!
          },
          lotto: {
            isCheckBonus: 0, // สลากต้องยังไม่เคยถูกตรวจ
          },
        },
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

      console.log(
        '📦 สลากที่ผ่านเงื่อนไข (จ่ายเงินแล้ว):',
        billSaleDetails.length,
        'ใบ',
      );

      for (let i = 0; i < billSaleDetails.length; i++) {
        const item = billSaleDetails[i];

        for (let j = 0; j < bonusResultDetails.length; j++) {
          const item2 = bonusResultDetails[j];
          let isWin = false;

          if (
            item2.number.length === 2 &&
            item.lotto.numbers.endsWith(item2.number)
          ) {
            isWin = true;
          } else if (
            item2.number.length === 3 &&
            (item.lotto.numbers.startsWith(item2.number) ||
              item.lotto.numbers.endsWith(item2.number))
          ) {
            isWin = true;
          } else if (item.lotto.numbers === item2.number) {
            isWin = true;
          }

          if (isWin) {
            await prisma.billSaleDetailIsBonus.create({
              data: {
                billSaleDetailId: item.id,
                bonusResultDetailId: item2.id,
              },
            });
          }
        }

        await prisma.lotto.update({
          data: {
            isCheckBonus: 1,
          },
          where: {
            id: item.lotto.id,
          },
        });
      }

      const resultBonus = await prisma.billSaleDetailIsBonus.findMany({
        include: {
          BillSaleDetail: {
            include: {
              billSale: true,
            },
          },
          BonusResultDetail: true,
        },
      });

      return { message: 'success', results: resultBonus };
    } catch (e: any) {
      console.error(e);
      return {
        status: 'error',
        message: 'ไม่สามารถดึงข้อมูลและบันทึกสลากได้',
        detail: e.message,
      };
    }
  }
}
