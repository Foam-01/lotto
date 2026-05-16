import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class TransferMoneyDto {
  @IsInt() @IsNotEmpty() billSaleId!: number;
  @IsString() @IsNotEmpty() tranferMoneyDate!: string;
  @IsString() @IsNotEmpty() tranferMoneyTime!: string;
  @IsInt() @IsNotEmpty() price!: number;
}

export class DeliverMoneyDto {
  @IsString() @IsNotEmpty() deliverDate!: string;
  @IsInt() @IsNotEmpty() price!: number;
  @IsInt() @IsNotEmpty() billSaleId!: number;
}

export class IncomeDto {
  @IsDateString() @IsNotEmpty() fromDate!: string;
  @IsDateString() @IsNotEmpty() toDate!: string;
}

export class ProfitDto {
  @IsDateString() @IsNotEmpty() fromDate!: string;
  @IsDateString() @IsNotEmpty() toDate!: string;
}
