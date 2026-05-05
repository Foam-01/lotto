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
import { LottoService } from './lotto.service';
import { ConfirmBuyDto, ConfirmPayDto, SearchLottoDto } from './dto/lotto.dto';

@Controller('/api/lotto')
export class LottoController {
  constructor(private readonly lottoService: LottoService) {}

  @Post('create') async create(@Body() lotto: any) {
    return this.lottoService.create(lotto);
  }
  @Get('list') async list() {
    return this.lottoService.list();
  }
  @Get('listForSale') async listForSale() {
    return this.lottoService.listForSale();
  }
  @Delete('remove/:id') async remove(@Param('id', ParseIntPipe) id: number) {
    return this.lottoService.remove(id);
  }
  @Put('edit/:id') async edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() lotto: any,
  ) {
    return this.lottoService.edit(id, lotto);
  }
  @Post('search') async search(@Body() dto: SearchLottoDto) {
    return this.lottoService.search(dto);
  }
  @Post('ConfirmBuy') async confirmBuy(@Body() dto: ConfirmBuyDto) {
    return this.lottoService.confirmBuy(dto);
  }
  @Get('billSale') async billSale() {
    return this.lottoService.getBillSale();
  }
  @Delete('removeBill/:id') async removeBill(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lottoService.removeBill(id);
  }
  @Post('ConfirmPay') async confirmPay(@Body() dto: ConfirmPayDto) {
    return this.lottoService.confirmPay(dto);
  }
  @Get('lottoInShop') async lottoInShop() {
    return this.lottoService.lottoInShop();
  }
  @Get('lottoForSend') async lottoForSend() {
    return this.lottoService.lottoForSend();
  }
  @Post('sendSave') async sendSave(@Body('data') data: any) {
    return this.lottoService.sendSave(data);
  }
}
