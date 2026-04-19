import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();
  constructor(private readonly jwtService: JwtService) {}

  // ตรวจสอบ User จาก ID (ใช้ตอนที่ Guard แกะ Token ออกมาแล้ว)
  async validateUserById(userId: number) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (e) {
      return null;
    }
  }

  // สร้าง Token หลังจาก Login สำเร็จ
  async login(user: any) {
    // payload คือข้อมูลที่จะฝังใน Token
    const payload = {
      sub: user.id,
      user: user.user, // ใช้ 'user' ตามชื่อคอลัมน์ใน pgAdmin
      level: user.level,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
