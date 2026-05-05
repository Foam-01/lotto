import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { LottoService } from './lotto.service';
import { ConfirmBuyDto, ConfirmPayDto, SearchLottoDto } from './dto/lotto.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; // 🌟 ดึงยามมาจากโฟลเดอร์ common

@Controller('/api/lotto')
export class LottoController {
  constructor(private readonly lottoService: LottoService) {}

  // ----------------------------------------------------
  // 🔒 โซนของพนักงาน (Admin) -> ต้อง Login เท่านั้น!
  // ----------------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() lotto: any) {
    return this.lottoService.create(lotto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async list() {
    return this.lottoService.list();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('remove/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.lottoService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('edit/:id')
  async edit(@Param('id', ParseIntPipe) id: number, @Body() lotto: any) {
    return this.lottoService.edit(id, lotto);
  }

  // ----------------------------------------------------
  // 🔓 โซนของลูกค้า (Public) -> ไม่ต้อง Login ก็ยิงได้
  // ----------------------------------------------------
  @Get('listForSale')
  async listForSale() {
    return this.lottoService.listForSale();
  }

  @Post('search')
  async search(@Body() dto: SearchLottoDto) {
    return this.lottoService.search(dto);
  }

  @Post('ConfirmBuy')
  async confirmBuy(@Body() dto: ConfirmBuyDto) {
    return this.lottoService.confirmBuy(dto);
  }

  // ... ฟังก์ชันที่เหลือด้านล่าง คุณสามารถเลือกแปะ @UseGuards(JwtAuthGuard) ได้ตามความเหมาะสมเลยครับ
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
