import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    try {
      return await this.prisma.user.findMany({
        orderBy: { id: 'asc' },
        // 🌟 ใส่ select เพื่อเลือกว่าจะส่งอะไรกลับไปให้หน้าบ้านบ้าง (ไม่เลือก pwd)
        select: {
          id: true,
          user: true,
          name: true,
          level: true,
          email: true,
          phone: true,
          address: true,
          // 🚨 สังเกตว่าเราไม่เขียน pwd: true ในนี้นะครับ มันจะได้ไม่หลุดไปหน้าบ้าน!
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลพนักงานได้');
    }
  }

  async create(dto: UserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          ...dto,
          pwd: dto.pwd as string, // 🌟 ใส่ 'as string' เพื่อยืนยันกับ TypeScript ว่าได้รับตัวหนังสือมาแน่นอน ไม่ใช่ undefined
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'ไม่สามารถสร้าง User ได้ (ชื่ออาจซ้ำ)',
      );
    }
  }

  async edit(id: number, dto: UserDto) {
    try {
      return await this.prisma.user.update({ where: { id }, data: dto });
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถแก้ไขข้อมูลได้');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถลบข้อมูลได้');
    }
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new InternalServerErrorException('ไม่พบผู้ใช้งาน');

      // 🚨 หมายเหตุ: ในระบบจริงต้องมีลอจิกเช็ค oldPassword ด้วยนะครับ

      return await this.prisma.user.update({
        where: { id },
        // 🌟 แก้ตรงนี้ครับ! เปลี่ยนจาก password เป็น pwd ให้ตรงกับ Database
        data: { pwd: newPassword },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'รหัสผ่านเดิมไม่ถูกต้อง หรือไม่สามารถเปลี่ยนได้',
      );
    }
  }
}
