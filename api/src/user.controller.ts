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
// 1. ต้องมีบรรทัดนี้เพื่อให้เรียกใช้ Prisma.User และ Prisma.PrismaClient ได้
import * as Prisma from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service';
import e from 'express';

@Controller('/api/user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // สร้าง instance สำหรับต่อ Database
  private prisma = new Prisma.PrismaClient();

  // 1. ดึงข้อมูลทั้งหมด
  @Get('list')
  async list() {
    try {
      return await this.prisma.user.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถดึงข้อมูลได้',
        error: e.message,
      };
    }
  }

  // 2. สร้าง User ใหม่
  @Post('create')
  async create(@Body() user: Prisma.User) {
    try {
      return await this.prisma.user.create({
        data: user,
      });
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถสร้าง User ได้ (อาจมีชื่อผู้ใช้ซ้ำ)',
        error: e.message,
      };
    }
  }

  // 3. แก้ไขข้อมูล
  @Put('edit/:id')
  async edit(@Param('id') id: string, @Body() user: Prisma.User) {
    try {
      return await this.prisma.user.update({
        where: { id: Number(id) },
        data: user,
      });
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถแก้ไขข้อมูลได้',
        error: e.message,
      };
    }
  }

  // 4. ลบข้อมูล
  @Delete('remove/:id')
  async remove(@Param('id') id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id: Number(id) },
      });
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถลบข้อมูลได้ (อาจไม่มี ID นี้ในระบบ)',
        error: e.message,
      };
    }
  }

  @Post('login')
  async login(@Body() user: { usr: string; pwd: string }) {
    try {
      // แก้ไขจาก prisma เป็น this.prisma
      const userData = await this.prisma.user.findFirst({
        where: {
          user: user.usr,
          pwd: user.pwd,
        },
      });

      if (userData) {
        // ส่ง userData ไปให้ authService สร้าง Token
        const token = await this.authService.login(userData);
        return token; // จะได้ { access_token: '...' } ตามที่เขียนใน Service
      }

      throw new UnauthorizedException('username or password invalid');
    } catch (e) {
      return { status: 401, message: e.message };
    }
  }

  @Get('info')
  async info(@Headers('Authorization') auth: string) {
    try {
      const jwt = auth.replace('Bearer ', '');
      const payload = this.jwtService.decode(jwt);

      return { payload: payload };
    } catch (e) {
      return { message: e.message };
    }
  }
}
