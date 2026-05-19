import { Module } from '@nestjs/common';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { PrismaModule } from '../../prisma/prisma.module'; // อ้างอิงพาธให้ตรงกับของเจ้านายนะครับ

@Module({
  imports: [PrismaModule], // 🌟 ขาดไม่ได้เลยตัวนี้ ต้องใช้คุยกับ Database
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannerModule {}
