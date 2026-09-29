import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// 🔒 ข้อมูลร้าน (สำหรับตั้งค่าหลังบ้าน) เป็นฟีเจอร์แอดมินล้วนๆ ไม่มีหน้าไหนของลูกค้าเรียกใช้
@UseGuards(JwtAuthGuard)
@Controller('/api/company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('create')
  async create(@Body() dto: CompanyDto) {
    return this.companyService.createCompany(dto);
  }

  @Get('info')
  async info() {
    return this.companyService.getCompanyInfo();
  }

  // 🌟 ใช้ ParseIntPipe ช่วยแปลง id เป็น Number ให้ตั้งแต่รับเข้า Controller เลย
  @Put('edit/:id')
  async edit(@Param('id', ParseIntPipe) id: number, @Body() dto: CompanyDto) {
    return this.companyService.updateCompany(id, dto);
  }
}
