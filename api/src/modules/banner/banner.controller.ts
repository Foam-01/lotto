import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BannerService } from './banner.service';
// 🌟 เพิ่มบรรทัดนี้เข้ามาแทน! (เรียกใช้ DTO ตัวจริง)
import { BannerDto } from './dto/banner.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('/api/banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  // 🔓 หน้าร้านลูกค้า (BannerSlider) เรียกอันนี้แบบไม่ล็อกอิน ต้องเปิดสาธารณะไว้
  @Get('list')
  async list() {
    return this.bannerService.list();
  }

  // 🔒 ที่เหลือเป็นฟีเจอร์จัดการแบนเนอร์ของแอดมินเท่านั้น
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() dto: BannerDto) {
    return this.bannerService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('edit/:id')
  async edit(@Param('id', ParseIntPipe) id: number, @Body() dto: BannerDto) {
    return this.bannerService.edit(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('remove/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.remove(id);
  }
}
