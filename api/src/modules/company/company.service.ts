import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CompanyDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompany(dto: CompanyDto) {
    try {
      return await this.prisma.company.create({
        data: dto,
      });
    } catch (e) {
      console.error('🔥 Prisma Error (Create Company):', e);
      throw new InternalServerErrorException(
        'ไม่สามารถสร้างข้อมูลร้านได้ (อาจมีชื่อซ้ำ)',
      );
    }
  }

  async getCompanyInfo() {
    try {
      return await this.prisma.company.findFirst();
    } catch (e) {
      console.error('🔥 Prisma Error (Get Company Info):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลร้านได้');
    }
  }

  async updateCompany(id: number, dto: CompanyDto) {
    try {
      return await this.prisma.company.update({
        where: { id: id },
        data: dto,
      });
    } catch (e) {
      console.error('🔥 Prisma Error (Update Company):', e);
      throw new InternalServerErrorException('ไม่สามารถแก้ไขข้อมูลร้านได้');
    }
  }
}
