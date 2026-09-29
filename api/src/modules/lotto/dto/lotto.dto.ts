import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class LottoDto {
  @IsString() @IsNotEmpty() numbers!: string;
  @IsInt() @IsNotEmpty() roundNumber!: number;
  @IsInt() @IsNotEmpty() bookNumber!: number;
  @IsInt() @IsNotEmpty() cost!: number;
  @IsInt() @IsNotEmpty() sale!: number;
}

export class SendSaveDto {
  @IsInt() @IsNotEmpty() billSaleId!: number;
  @IsOptional() @IsString() sendName?: string;
  @IsNotEmpty() sendDate!: string | Date;
  @IsString() @IsNotEmpty() sendTime!: string;
  @IsOptional() @IsString() traceCode?: string;
  @IsOptional() @IsString() sendPlatform?: string;
  @IsOptional() @IsString() remark?: string;
  @IsInt() @IsNotEmpty() price!: number;
}

export class ChangePriceItemDto {
  @IsInt() @IsNotEmpty() id!: number;
  @IsInt() @IsNotEmpty() newPrice!: number;
}

export class ChangePriceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangePriceItemDto)
  lottos!: ChangePriceItemDto[];
}

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
