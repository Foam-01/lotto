import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SearchLottoDto {
  @IsString() @IsNotEmpty() numbers!: string;
  @IsString() @IsNotEmpty() position!: string;
}

export class ConfirmBuyDto {
  @IsString() @IsNotEmpty() customerName!: string;
  @IsString() @IsNotEmpty() customerPhone!: string;
  @IsOptional() customerAddress?: string; // ปล่อยว่างได้
  @IsArray() carts!: any[];
}

export class ConfirmPayDto {
  @IsInt() @IsNotEmpty() billSaleId!: number;
  @IsString() @IsNotEmpty() payAlertDate!: string;
  @IsString() @IsNotEmpty() payDate!: string;
  @IsOptional() payRemark?: string;
  @IsString() @IsNotEmpty() payTime!: string;
}
