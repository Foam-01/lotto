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

          await this.prisma.billSaleDetail.create({
            data: {
              billSaleId: res.id,
              lottoId: cartData.item.id, // 👈 แก้ตรงนี้! ต้องเจาะเข้าไปที่ .item.id
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
}
