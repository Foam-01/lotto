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
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import type { Company } from '@prisma/client';

@Controller('/api/company')
export class CompanyController {
  private prisma = new PrismaClient();

  @Post('create')
  async create(@Body() company: Company) {
    try {
      // 4. ใช้ this.prisma ได้แล้ว และเพิ่มคำว่า data: ตามหลักของ Prisma
      return await this.prisma.company.create({
        data: company,
      });
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถสร้าง Company ได้ (อาจมีชื่อซ้ำ)',
        error: e.message,
      };
    }
  }
}
