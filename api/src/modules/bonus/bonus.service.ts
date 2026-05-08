import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class BonusService {
  constructor(private readonly prisma: PrismaService) {}

  async getBonus() {
    try {
      // API สำหรับดูผลสลากกินแบ่งรัฐบาลงวดล่าสุด   เรย์ริฟฟี
      const res = await axios.get('https://lotto.api.rayriffy.com/latest');
      const data = res.data.response;
      const bonusDate = data.date; // "16 เมษายน 2569"

      const row = await this.prisma.bonusResultDetail.findMany({
        where: { bonusDate: bonusDate },
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
          insertData.push({ number: num, price: reward, bonusDate: bonusDate });
        });
      });

      data.runningNumbers.forEach((runGroup) => {
        const reward = Number(runGroup.reward);
        runGroup.number.forEach((num) => {
          insertData.push({ number: num, price: reward, bonusDate: bonusDate });
        });
      });

      await this.prisma.bonusResultDetail.createMany({ data: insertData });

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
      const errorDetail = e.response?.data || e.message;
      console.error('🔥 API Error (getBonus):', errorDetail);
      throw new InternalServerErrorException(
        'ไม่สามารถดึงข้อมูลและบันทึกสลากได้ (API ต้นทางอาจมีปัญหา)',
      );
    }
  }

  async list() {
    try {
      const res = await this.prisma.bonusResultDetail.groupBy({
        by: ['bonusDate'],
        orderBy: { bonusDate: 'desc' },
      });
      return { results: res };
    } catch (e: any) {
      console.error('🔥 Error (list bonus):', e.message);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }

  async listDetail(bonusDate: string) {
    try {
      const res = await this.prisma.bonusResultDetail.findMany({
        where: { bonusDate: bonusDate },
        orderBy: { price: 'desc' },
      });
      return { results: res };
    } catch (e: any) {
      console.error('🔥 Error (listDetail bonus):', e.message);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }

  async checkBonus() {
    try {
      const billSaleDetails = await this.prisma.billSaleDetail.findMany({
        include: { lotto: true },
        where: {
          billSale: { payDate: { not: null } },
          lotto: { isCheckBonus: 0 },
        },
      });

      const lastResult = await this.prisma.bonusResultDetail.findFirst({
        orderBy: { bonusDate: 'desc' },
      });

      const bonusResultDetails = await this.prisma.bonusResultDetail.findMany({
        where: { bonusDate: lastResult?.bonusDate },
      });

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
            await this.prisma.billSaleDetailIsBonus.create({
              data: {
                billSaleDetailId: item.id,
                bonusResultDetailId: item2.id,
              },
            });
          }
        }

        await this.prisma.lotto.update({
          data: { isCheckBonus: 1 },
          where: { id: item.lotto.id },
        });
      }

      const resultBonus = await this.prisma.billSaleDetailIsBonus.findMany({
        include: {
          BillSaleDetail: { include: { billSale: true } },
          BonusResultDetail: true,
        },
      });

      return { message: 'success', results: resultBonus };
    } catch (e: any) {
      console.error('🔥 Error (checkBonus):', e);
      throw new InternalServerErrorException('ไม่สามารถตรวจและบันทึกสลากได้');
    }
  }
}
