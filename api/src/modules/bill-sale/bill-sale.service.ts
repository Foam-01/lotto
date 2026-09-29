import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TransferMoneyDto,
  DeliverMoneyDto,
  IncomeDto,
  ProfitDto,
} from './dto/bill-sale.dto';

@Injectable()
export class BillSaleService {
  constructor(private readonly prisma: PrismaService) {}

  async transferMoney(dto: TransferMoneyDto) {
    try {
      await this.prisma.billSale.update({
        where: { id: dto.billSaleId },
        data: {
          transferMoneyTime: dto.transferMoneyTime,
          // 🌟 1. แปลงข้อความให้เป็น Date Object เพื่อให้ Prisma เข้าใจ
          transferMoneyDate: new Date(dto.transferMoneyDate),
          price: dto.price,
        },
      });
      return { message: 'success' };
    } catch (e) {
      if ((e as { code?: string })?.code === 'P2025') {
        throw new NotFoundException('ไม่พบบิลนี้ในระบบ');
      }
      // 🌟 2. ให้พิมพ์ Error ตัวจริงออกมาใน Terminal จะได้รู้สาเหตุชัดๆ
      console.error('🔥 Prisma Error (Transfer):', e);
      throw new InternalServerErrorException('ไม่สามารถบันทึกการโอนเงินได้');
    }
  }

  async deliverMoney(dto: DeliverMoneyDto) {
    try {
      await this.prisma.billSale.update({
        where: { id: dto.billSaleId },
        data: {
          // 🌟 ทำเหมือนกันตรงนี้ด้วย
          deliverDate: new Date(dto.deliverDate),
          price: dto.price,
        },
      });
      return { message: 'success' };
    } catch (e) {
      if ((e as { code?: string })?.code === 'P2025') {
        throw new NotFoundException('ไม่พบบิลนี้ในระบบ');
      }
      console.error('🔥 Prisma Error (Deliver):', e);
      throw new InternalServerErrorException('ไม่สามารถบันทึกการส่งมอบเงินได้');
    }
  }

  async getIncome(dto: IncomeDto) {
    try {
      const res = await this.prisma.billSaleDetail.findMany({
        where: {
          billSale: {
            payDate: {
              not: null,
              gte: new Date(dto.fromDate).toISOString(),
              lte: new Date(dto.toDate).toISOString(),
            },
          },
        },
        include: {
          lotto: true,
          billSale: true,
        },
      });
      return { results: res };
    } catch (e) {
      console.error('🔥 Prisma Error (Income):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลรายได้ได้');
    }
  }

  async getProfit(dto: ProfitDto) {
    try {
      const fromDate = new Date(dto.fromDate).toISOString();
      const toDate = new Date(dto.toDate).toISOString();

      const billSaleDetails = await this.prisma.billSaleDetail.findMany({
        where: {
          billSale: {
            payDate: {
              gte: fromDate,
              lte: toDate,
            },
          },
        },
        include: {
          lotto: true,
          billSale: true,
        }
      });

      const lottoIsBonus = await this.prisma.lottoIsBonus.findMany({
        include: {
          BonusResultDetail: true, // ดึงข้อมูลรายละเอียดรางวัลมาด้วย
        },
      });

      // 🌟 1. คำนวณยอดขายรวมจากบิลลูกค้า และต้นทุนรวมของสลากที่ขายได้
      let totalSale = 0;
      let totalCost = 0;
      billSaleDetails.forEach((item) => {
        totalSale += item.price || 0;
        totalCost += item.lotto?.cost || 0;
      });
      const profitFromSale = totalSale - totalCost;

      // 🌟 2. คำนวณยอดเงินรางวัลรวมที่แผงเราถูกเอง
      // หมายเหตุ: lottoIsBonus ด้านบนไม่ได้กรองตามช่วงวันที่ fromDate/toDate เหมือน billSaleDetails
      // เพราะ BonusResultDetail.bonusDate เก็บเป็นข้อความไทย (เช่น "16 เมษายน 2569") ไม่ใช่ DateTime
      // จึงกรองตามช่วงวันที่ด้วย query ปกติไม่ได้ ยอดนี้จึงยังเป็นยอดสะสมทั้งหมด ไม่ใช่เฉพาะช่วงที่เลือก
      const totalBonus = lottoIsBonus.reduce((sum, item) => {
        return sum + (item.BonusResultDetail?.price || 0);
      }, 0);

      // 🌟 3. กำไรสุทธิรวมทั้งหมด (กำไรจากการขายหักต้นทุนแล้ว + เงินรางวัลที่แผงถูกเอง)
      const grandTotal = profitFromSale + totalBonus;

      // ส่งกลับไปให้หน้าบ้านแบบแพ็คเกจพรีเมียม!
      return {
        billSaleDetails,
        lottoIsBonus,
        summary: {
          totalSale: totalSale,
          totalCost: totalCost,
          profitFromSale: profitFromSale,
          totalBonus: totalBonus,
          grandTotal: grandTotal,
        },
      };
    } catch (e) {
      console.error('🔥 Prisma Error (Profit):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลกำไรได้');
    }
  }
}
