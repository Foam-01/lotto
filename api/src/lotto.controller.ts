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
import type { BillSaleDetail, Lotto } from '@prisma/client';
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

  
}
