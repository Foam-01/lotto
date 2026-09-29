import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { hashPassword, verifyPassword } from '../../common/password.util';

// 🌟 field ที่ปลอดภัยสำหรับส่งกลับไปให้ client (ไม่มี pwd แม้จะ hash แล้วก็ตาม)
const SAFE_USER_SELECT = {
  id: true,
  user: true,
  name: true,
  level: true,
  email: true,
  phone: true,
  address: true,
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    try {
      return await this.prisma.user.findMany({
        orderBy: { id: 'asc' },
        // 🌟 ใส่ select เพื่อเลือกว่าจะส่งอะไรกลับไปให้หน้าบ้านบ้าง (ไม่เลือก pwd)
        select: SAFE_USER_SELECT,
        // 🚨 สังเกตว่าเราไม่เขียน pwd: true ในนี้นะครับ มันจะได้ไม่หลุดไปหน้าบ้าน!
      });
    } catch (e) {
      console.error('🔥 Error (user list):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลพนักงานได้');
    }
  }

  async create(dto: UserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          ...dto,
          pwd: await hashPassword(dto.pwd as string),
        },
        select: SAFE_USER_SELECT,
      });
    } catch (e) {
      if ((e as { code?: string })?.code === 'P2002') {
        throw new ConflictException('มีชื่อผู้ใช้หรืออีเมลนี้อยู่ในระบบแล้ว');
      }
      console.error('🔥 Error (user create):', e);
      throw new InternalServerErrorException('ไม่สามารถสร้าง User ได้');
    }
  }

  async edit(id: number, dto: UserDto) {
    try {
      const data: UserDto = { ...dto };
      if (data.pwd) {
        data.pwd = await hashPassword(data.pwd);
      } else {
        delete data.pwd;
      }
      return await this.prisma.user.update({
        where: { id },
        data,
        select: SAFE_USER_SELECT,
      });
    } catch (e) {
      if ((e as { code?: string })?.code === 'P2025') {
        throw new NotFoundException('ไม่พบผู้ใช้งานนี้ในระบบ');
      }
      if ((e as { code?: string })?.code === 'P2002') {
        throw new ConflictException('มีชื่อผู้ใช้หรืออีเมลนี้อยู่ในระบบแล้ว');
      }
      console.error('🔥 Error (user edit):', e);
      throw new InternalServerErrorException('ไม่สามารถแก้ไขข้อมูลได้');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({
        where: { id },
        select: SAFE_USER_SELECT,
      });
    } catch (e) {
      if ((e as { code?: string })?.code === 'P2025') {
        throw new NotFoundException('ไม่พบผู้ใช้งานนี้ในระบบ');
      }
      console.error('🔥 Error (user remove):', e);
      throw new InternalServerErrorException('ไม่สามารถลบข้อมูลได้');
    }
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    // 🌟 ต้องเช็ค oldPassword ให้ตรงก่อนเสมอ (ของเดิมไม่ได้เช็คจุดนี้เลย)
    const isOldPasswordCorrect = await verifyPassword(oldPassword, user.pwd);
    if (!isOldPasswordCorrect) {
      throw new BadRequestException('รหัสผ่านเดิมไม่ถูกต้อง');
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: { pwd: await hashPassword(newPassword) },
        select: SAFE_USER_SELECT,
      });
    } catch (e) {
      console.error('🔥 Error (changePassword):', e);
      throw new InternalServerErrorException('ไม่สามารถเปลี่ยนรหัสผ่านได้');
    }
  }
}
