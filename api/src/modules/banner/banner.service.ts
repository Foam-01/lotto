import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // อ้างอิงพาธให้ตรงกับโปรเจกต์เจ้านายนะครับ
// 🌟 เพิ่มบรรทัดนี้เข้ามาแทนตัว type BannerDto = any; เหมือนกันครับ
import { BannerDto } from './dto/banner.dto';

@Injectable()
export class BannerService {
  constructor(private readonly prisma: PrismaService) {}

  // 🌟 ดึงข้อมูลแบนเนอร์ทั้งหมด (เรียงตามลำดับ sequence หรือ id)
  async list() {
    try {
      return await this.prisma.banner.findMany({
        orderBy: [
          { sequence: 'asc' }, // เรียงตามลำดับที่ตั้งไว้ก่อน
          { id: 'desc' }, // ถ้าลำดับเท่ากัน เอาอันใหม่สุดขึ้นก่อน
        ],
      });
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลแบนเนอร์ได้');
    }
  }

  // 🌟 เพิ่มแบนเนอร์ใหม่
  async create(dto: BannerDto) {
    try {
      return await this.prisma.banner.create({
        data: dto,
      });
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถสร้างแบนเนอร์ได้');
    }
  }

  // 🌟 แก้ไขแบนเนอร์
  async edit(id: number, dto: BannerDto) {
    try {
      return await this.prisma.banner.update({
        where: { id },
        data: dto,
      });
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถแก้ไขแบนเนอร์ได้');
    }
  }

  // 🌟 ลบแบนเนอร์
  async remove(id: number) {
    try {
      return await this.prisma.banner.delete({
        where: { id },
      });
    } catch (e) {
      throw new InternalServerErrorException('ไม่สามารถลบแบนเนอร์ได้');
    }
  }
}
