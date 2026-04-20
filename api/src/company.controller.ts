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
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Get('info')
  async info() {
    try {
      return await this.prisma.company.findFirst();
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถดึงข้อมูล Company ได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Put('edit/:id')
  async edit(@Body() company: Company, @Param('id') id: string) {
    try {
      const idValue = parseInt(id);
      return await this.prisma.company.update({
        data: company,
        where: { id: idValue },
      });
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถแก้ไข Company ได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }
}
