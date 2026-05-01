import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UnauthorizedException,
  Headers,
  Query,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { BillSaleDetail, BillSaleForSend, Lotto } from '@prisma/client';
import { start } from 'repl';
import { startWith } from 'rxjs';

@Controller('/api/lotto')
export class LottoController {
  // ✅ สร้าง instance ของ Prisma แบบตรงๆ เหมือนที่ทำใน CompanyController
  private prisma = new PrismaClient();

  @Post('create')
  async create(@Body() lotto: Lotto) {
    try {
      const res = await this.prisma.lotto.create({
        data: lotto,
      });
      return { result: res };
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถบันทึกสลากได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Get('list')
  async list() {
    return {
      result: await this.prisma.lotto.findMany({
        orderBy: { id: 'desc' },
      }),
    };
  }

  @Delete('remove/:id')
  async remove(@Param('id') id: string) {
    try {
      const res = await this.prisma.lotto.delete({
        where: { id: Number(id) },
      });
      return { result: res };
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถลบข้อมูลได้ (อาจไม่มี ID นี้ในระบบ)',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Put('edit/:id')
  async edit(@Body() lotto: Lotto, @Param('id') id: string) {
    return {
      result: await this.prisma.lotto.update({
        where: { id: Number(id) },
        data: lotto,
      }),
    };
  }

  @Post('search')
  async search(
    @Body('numbers') input: string,
    @Body('position') position: string,
  ) {
    let condition = {};

    if (position == 'start') {
      condition = {
        startsWith: input,
      };
    } else {
      condition = {
        endsWith: input,
      };
    }
    return {
      results: await this.prisma.lotto.findMany({
        where: {
          numbers: condition,
        },
      }),
    };
  }

  @Post('ConfirmBuy')
  async confirmBuy(
    @Body('customerName') customerName: string,
    @Body('customerPhone') customerPhone: string,
    @Body('customerAddress') customerAddress: string,
    @Body('carts') carts: any[], // 👈 เปลี่ยนเป็น any[] เพราะโครงสร้างไม่ตรงกับ BillSaleDetail
  ) {
    try {
      const res = await this.prisma.billSale.create({
        data: {
          customerName: customerName,
          customerPhone: customerPhone,
          customerAddress: customerAddress,
          createdDate: new Date(),
        },
      });

      if (res.id !== undefined) {
        for (let i = 0; i < carts.length; i++) {
          const cartData = carts[i]; // หน้าตาจะเป็น { item: { id: 4315, ... } }

          const lotto = await this.prisma.lotto.findFirst({
            where: {
              id: cartData.item.id, // 👈 แก้ตรงนี้! เปลี่ยนจาก item.id เป็น cartData.item.id
            },
          });

          await this.prisma.billSaleDetail.create({
            data: {
              billSaleId: res.id,
              lottoId: cartData.item.id,
              // ใส่ ?? 0 ดักไว้หน่อย เผื่อหา lotto ไม่เจอ Prisma จะได้ไม่ด่าเรื่องค่า undefined ครับ
              price: lotto?.sale ?? 0,
            },
          });
        }

        return { message: 'success' };
      }
      return { message: 'insert error' };
    } catch (e) {
      // 👈 พิมพ์ Error ตัวจริงออกมาดูที่หน้าต่าง Terminal เผื่อพังเรื่องอื่น
      console.error('🔥 DATABASE ERROR:', e);

      return {
        status: 500,
        message: 'ไม่สามารถบันทึกสลากได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Get('/billSale')
  async billSale() {
    try {
      const res = await this.prisma.billSale.findMany({
        include: {
          billSaleDetail: {
            include: {
              lotto: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      });

      return { result: res };
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถดึงข้อมูลได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Delete('/removeBill/:id')
  async removeBill(@Param('id') id: string) {
    try {
      const idValue = parseInt(id);

      // 🌟 ใช้ $transaction เพื่อผูก 2 คำสั่งนี้เข้าด้วยกัน
      await this.prisma.$transaction([
        // 1. ลบลูกก่อน (Detail)
        this.prisma.billSaleDetail.deleteMany({
          where: { billSaleId: idValue },
        }),
        // 2. ลบแม่ตาม (Bill)
        this.prisma.billSale.delete({
          where: { id: idValue },
        }),
      ]);

      return { message: 'success' };
    } catch (e) {
      console.error('🔥 Delete Bill Error:', e); // พิมพ์ Error ดูเผื่อพังจุดอื่น
      return {
        status: 500,
        message: 'ไม่สามารถลบข้อมูลได้ (อาจไม่มี ID นี้ในระบบ)',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Post('ConfirmPay')
  async ConfirmPay(
    @Body('billSaleId') billSaleId: number, // 👈 1. เปลี่ยนเป็น number เพราะหน้าบ้านส่งมาเป็นเลข
    @Body('payAlertDate') payAlertDate: string,
    @Body('payDate') payDate: string,
    @Body('payRemark') payRemark: string,
    @Body('payTime') payTime: string,
  ) {
    try {
      await this.prisma.billSale.update({
        where: {
          id: billSaleId, // 👈 ใช้ตัวเลขตรงๆ ได้เลย ไม่ต้อง parseInt แล้ว
        },
        data: {
          // 🌟 2. แปลงข้อความวันที่ให้กลายเป็น Date Object ก่อนบันทึกลง Prisma
          payAlertDate: new Date(payAlertDate),
          payDate: new Date(payDate),
          payRemark: payRemark,
          payTime: payTime,
        },
      });
      return { message: 'success' };
    } catch (e) {
      console.error('🔥 ConfirmPay Error:', e);
      return {
        status: 500,
        message: 'ไม่สามารถบันทึกสลากได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Get('/lottoInShop')
  async lottoInShop() {
    try {
      const results = await this.prisma.billSale.findMany({
        where: {
          // 1. ต้องจ่ายเงินแล้ว
          payDate: {
            not: null,
          },
          // 2. ไม่มีที่อยู่ (ครอบคลุมทั้งค่าว่างและค่า null)
          OR: [{ customerAddress: '' }, { customerAddress: null }],
        },
        orderBy: {
          id: 'desc',
        },
        include: {
          billSaleDetail: {
            include: {
              lotto: true,
            },
          },
        },
      });

      return { results: results };
    } catch (e) {
      console.error('🔥 Error lottoInShop:', e);
      return {
        status: 500,
        message: 'ไม่สามารถดึงข้อมูลได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Get('/lottoForSend')
  async lottoForSend() {
    try {
      const results = await this.prisma.billSale.findMany({
        where: {
          // 1. ต้องจ่ายเงินแล้ว
          payDate: {
            not: null,
          },
          customerAddress: {
            not: '',
          },
        },
        orderBy: {
          id: 'desc',
        },
        include: {
          billSaleDetail: {
            include: {
              lotto: true,
            },
          },
          billSaleForSends: true,
        },
      });

      return { results: results };
    } catch (e) {
      console.error('🔥 Error lottoInShop:', e);
      return {
        status: 500,
        message: 'ไม่สามารถดึงข้อมูลได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Post('/sendSave')
  async sendSave(@Body('data') data: BillSaleForSend) {
     try {
      const rowCount = await this.prisma.billSaleForSend.findMany({
        where: {
          billSaleId: data.billSaleId
        }
      })
      if (rowCount.length == 0 ) {

      const res = await this.prisma.billSaleForSend.create({
        data: data
      })
      if (res.id > 0) {
        return { message: 'success' }
      }
      return { message: 'error' }
    } else {
      return {message: 'data exist'}
    }
     } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถบันทึกสลากได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      }
     }
  }
}
