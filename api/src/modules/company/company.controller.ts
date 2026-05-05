import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/company.dto';

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
