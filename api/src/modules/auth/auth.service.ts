import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import {
  hashPassword,
  isLegacyPlainPassword,
  verifyPassword,
} from '../../common/password.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { user: dto.usr },
    });

    if (!user || !(await verifyPassword(dto.pwd, user.pwd))) {
      throw new UnauthorizedException('Username หรือ Password ไม่ถูกต้อง');
    }

    // 🌟 Lazy migration: ถ้าบัญชีนี้ยังเก็บรหัสผ่านแบบ plain text อยู่ (ของเก่าก่อนเปลี่ยนมาใช้ bcrypt)
    // ให้แปลงเป็น bcrypt hash ทันทีที่ล็อกอินสำเร็จ โดยไม่กระทบผู้ใช้เลยสักคน ไม่ต้องรัน migration แยก
    if (isLegacyPlainPassword(user.pwd)) {
      const hashedPwd = await hashPassword(dto.pwd);
      await this.prisma.user
        .update({ where: { id: user.id }, data: { pwd: hashedPwd } })
        .catch(() => {
          // ถ้าอัปเกรดไม่สำเร็จก็ไม่เป็นไร ล็อกอินรอบนี้ผ่านไปแล้ว ลองใหม่ตอนล็อกอินครั้งถัดไป
        });
    }

    const payload = { sub: user.id, user: user.user, level: user.level };
    return { token: this.jwtService.sign(payload) };
  }

  async validateUserById(userId: number) {
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }

  async getInfo(authHeader: string) {
    try {
      const jwt = authHeader.replace('Bearer ', '');
      const payload = this.jwtService.verify(jwt);
      return { payload };
    } catch (e) {
      throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุแล้ว');
    }
  }
}
