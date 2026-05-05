import { Module } from '@nestjs/common';
import { BillSaleController } from './bill-sale.controller';
import { BillSaleService } from './bill-sale.service';

@Module({
  controllers: [BillSaleController],
  providers: [BillSaleService],
})
export class BillSaleModule {}
