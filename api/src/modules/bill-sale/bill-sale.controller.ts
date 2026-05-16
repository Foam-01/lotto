import { Body, Controller, Post } from '@nestjs/common';
import { BillSaleService } from './bill-sale.service';
import {
  TransferMoneyDto,
  DeliverMoneyDto,
  IncomeDto,
} from './dto/bill-sale.dto';

@Controller('/api/billSale')
export class BillSaleController {
  constructor(private readonly billSaleService: BillSaleService) {}

  @Post('/TranferMoney')
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
  async profit(@Body() dto: IncomeDto) {
    return this.billSaleService.getIncome(dto);
  }
}
