import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfirmBuyDto, ConfirmPayDto, SearchLottoDto } from './dto/lotto.dto';

@Injectable()
export class LottoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    try {
      // 🌟 ใส่ { result: ... } ครอบเอาไว้เพื่อให้ React หน้าบ้านอ่านรู้เรื่องครับ
      const res = await this.prisma.lotto.create({ data });
      return { result: res };
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถบันทึกสลากได้');
    }
  }

  async list() {
    return {
      result: await this.prisma.lotto.findMany({ orderBy: { id: 'desc' } }),
    };
  }

  async listForSale() {
    try {
      const results = await this.prisma.lotto.findMany({
        where: {
          billSaleDetails: { none: { billSale: { payDate: { not: null } } } },
        },
        orderBy: { id: 'desc' },
      });
      return { results };
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }

  async remove(id: number) {
    try {
      return { result: await this.prisma.lotto.delete({ where: { id } }) };
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถลบข้อมูลได้');
    }
  }

  async edit(id: number, data: any) {
    try {
      return {
        result: await this.prisma.lotto.update({ where: { id }, data }),
      };
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถแก้ไขข้อมูลได้');
    }
  }

  async search(dto: SearchLottoDto) {
    const condition =
      dto.position === 'start'
        ? { startsWith: dto.numbers }
        : { endsWith: dto.numbers };
    return {
      results: await this.prisma.lotto.findMany({
        where: { numbers: condition },
      }),
    };
  }

  async confirmBuy(dto: ConfirmBuyDto) {
    try {
      const res = await this.prisma.billSale.create({
        data: {
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerAddress: dto.customerAddress,
          createdDate: new Date(),
        },
      });

      for (let i = 0; i < dto.carts.length; i++) {
        const cartData = dto.carts[i];
        const lotto = await this.prisma.lotto.findFirst({
          where: { id: cartData.item.id },
        });
        await this.prisma.billSaleDetail.create({
          data: {
            billSaleId: res.id,
            lottoId: cartData.item.id,
            price: lotto?.sale ?? 0,
          },
        });
      }
      return { message: 'success' };
    } catch (e) {
      console.error('🔥 Error ConfirmBuy:', e);
      throw new InternalServerErrorException('ไม่สามารถบันทึกคำสั่งซื้อได้');
    }
  }

  async getBillSale() {
    try {
      const res = await this.prisma.billSale.findMany({
        include: { billSaleDetail: { include: { lotto: true } } },
        orderBy: { id: 'desc' },
      });
      return { result: res };
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลบิลได้');
    }
  }

  async removeBill(id: number) {
    try {
      // 🌟 ใช้ Transaction ลบลูกก่อน แล้วค่อยลบแม่ พร้อมกัน
      await this.prisma.$transaction([
        this.prisma.billSaleDetail.deleteMany({ where: { billSaleId: id } }),
        this.prisma.billSale.delete({ where: { id } }),
      ]);
      return { message: 'success' };
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถลบบิลได้');
    }
  }

  async confirmPay(dto: ConfirmPayDto) {
    try {
      await this.prisma.billSale.update({
        where: { id: dto.billSaleId },
        data: {
          payAlertDate: new Date(dto.payAlertDate),
          payDate: new Date(dto.payDate),
          payRemark: dto.payRemark,
          payTime: dto.payTime,
        },
      });
      return { message: 'success' };
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถบันทึกการชำระเงินได้');
    }
  }

  async lottoInShop() {
    try {
      const results = await this.prisma.billSale.findMany({
        where: {
          payDate: { not: null },
          OR: [{ customerAddress: '' }, { customerAddress: null }],
        },
        orderBy: { id: 'desc' },
        include: { billSaleDetail: { include: { lotto: true } } },
      });
      return { results };
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }

  async lottoForSend() {
    try {
      const results = await this.prisma.billSale.findMany({
        where: { payDate: { not: null }, customerAddress: { not: '' } },
        orderBy: { id: 'desc' },
        include: {
          billSaleDetail: { include: { lotto: true } },
          billSaleForSends: true,
        },
      });
      return { results };
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }

  async sendSave(data: any) {
    try {
      const rowCount = await this.prisma.billSaleForSend.findMany({
        where: { billSaleId: data.billSaleId },
      });
      if (rowCount.length == 0) {
        await this.prisma.billSaleForSend.create({ data });
        return { message: 'success' };
      }
      return { message: 'data exist' };
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถบันทึกได้');
    }
  }
}
