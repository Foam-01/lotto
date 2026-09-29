import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// 🔒 ทั้งหมดในนี้เป็นฟีเจอร์แอดมิน (ดึง/ตรวจผลรางวัล) ไม่มีหน้าไหนของลูกค้าเรียกใช้
@UseGuards(JwtAuthGuard)
@Controller('/api/bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Get('/getBonus')
  async getBonus() {
    return this.bonusService.getBonus();
  }

  @Get('/list')
  async list() {
    return this.bonusService.list();
  }

  @Get('/listDetail/:bonusDate')
  async listDetail(@Param('bonusDate') bonusDate: string) {
    return this.bonusService.listDetail(bonusDate);
  }

  @Get('/checkBonus')
  async checkBonus() {
    return this.bonusService.checkBonus();
  }

  
}
