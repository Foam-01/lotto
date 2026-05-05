import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    try {
      return await this.prisma.user.findMany({ orderBy: { id: 'asc' } });
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลพนักงานได้');
    }
  }

  async create(dto: UserDto) {
    try {
      return await this.prisma.user.create({ data: dto });
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
}
