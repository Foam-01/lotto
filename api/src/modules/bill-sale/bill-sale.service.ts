import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TransferMoneyDto,
  DeliverMoneyDto,
  IncomeDto,
} from './dto/bill-sale.dto';

@Injectable()
export class BillSaleService {
  constructor(private readonly prisma: PrismaService) {}

  async transferMoney(dto: TransferMoneyDto) {
    try {
      await this.prisma.billSale.update({
        where: { id: dto.billSaleId },
        data: {
          tranferMoneyTime: dto.tranferMoneyTime,
          // 🌟 1. แปลงข้อความให้เป็น Date Object เพื่อให้ Prisma เข้าใจ
          tranferMoneyDate: new Date(dto.tranferMoneyDate),
          price: dto.price,
        },
      });
      return { message: 'success' };
    } catch (e) {
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
        }
      });
      return { results: res };
    } catch (e) {
      console.error('🔥 Prisma Error (Income):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลรายได้ได้');
    }
  }
}
