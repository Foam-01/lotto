import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BillSaleService } from './bill-sale.service';
import {
  TransferMoneyDto,
  DeliverMoneyDto,
  IncomeDto,
  ProfitDto,
} from './dto/bill-sale.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// 🔒 ทั้งหมดในนี้เป็นฟีเจอร์แอดมิน (โอนเงินรางวัล/รายงานรายได้-กำไร) ต้องล็อกอิน
// (Frontend ทุกจุดแนบ Authorization header อยู่แล้ว)
@UseGuards(JwtAuthGuard)
@Controller('/api/billSale')
export class BillSaleController {
  constructor(private readonly billSaleService: BillSaleService) {}

  @Post('/TransferMoney')
  async transferMoney(@Body() dto: TransferMoneyDto) {
    return this.billSaleService.transferMoney(dto);
  }

  @Post('/deliverMoney')
  async deliverMoney(@Body() dto: DeliverMoneyDto) {
    return this.billSaleService.deliverMoney(dto);
  }

  @Post('/income')
  async income(@Body() dto: IncomeDto) {
    return this.billSaleService.getIncome(dto);
  }

  @Post('/profit')
  async profit(@Body() dto: ProfitDto) {
    return this.billSaleService.getProfit(dto);
  }
}
