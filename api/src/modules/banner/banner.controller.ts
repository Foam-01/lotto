import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { BannerService } from './banner.service';
// 🌟 เพิ่มบรรทัดนี้เข้ามาแทน! (เรียกใช้ DTO ตัวจริง)
import { BannerDto } from './dto/banner.dto';

@Controller('/api/banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get('list')
  async list() {
    return this.bannerService.list();
  }

  @Post('create')
  async create(@Body() dto: BannerDto) {
    return this.bannerService.create(dto);
  }

  @Put('edit/:id')
  async edit(@Param('id', ParseIntPipe) id: number, @Body() dto: BannerDto) {
    return this.bannerService.edit(id, dto);
  }

  @Delete('remove/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.remove(id);
  }
}
