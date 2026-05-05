import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { user: dto.usr, pwd: dto.pwd },
    });

    if (!user) {
      throw new UnauthorizedException('Username หรือ Password ไม่ถูกต้อง');
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
