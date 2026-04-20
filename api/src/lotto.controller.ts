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
import type { Lotto } from '@prisma/client';

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
        return { result: await this.prisma.lotto.findMany({
            orderBy: { id: 'desc' },
        }) };
    }
}
