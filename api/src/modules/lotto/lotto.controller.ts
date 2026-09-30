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
import {
  ChangePriceDto,
  ConfirmBuyDto,
  ConfirmPayDto,
  LottoDto,
  SearchLottoDto,
  SendSaveDto,
} from './dto/lotto.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; // 🌟 ดึงยามมาจากโฟลเดอร์ common

@Controller('/api/lotto')
export class LottoController {
  constructor(private readonly lottoService: LottoService) {}

  // ----------------------------------------------------
  // 🔒 โซนของพนักงาน (Admin) -> ต้อง Login เท่านั้น!
  // ----------------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() dto: LottoDto) {
    return this.lottoService.create(dto);
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
  async edit(@Param('id', ParseIntPipe) id: number, @Body() dto: LottoDto) {
    return this.lottoService.edit(id, dto);
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

  // ----------------------------------------------------
  // 🔒 โซนของพนักงาน (Admin) เช่นกัน — Guard เดิมหายไป เพิ่มกลับเข้ามาให้ครบ
  // (Frontend ทุกจุดนี้แนบ Authorization header อยู่แล้ว ไม่กระทบการใช้งาน)
  // ----------------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Get('billSale')
  async billSale() {
    return this.lottoService.getBillSale();
  }
  @UseGuards(JwtAuthGuard)
  @Delete('removeBill/:id')
  async removeBill(@Param('id', ParseIntPipe) id: number) {
    return this.lottoService.removeBill(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post('ConfirmPay')
  async confirmPay(@Body() dto: ConfirmPayDto) {
    return this.lottoService.confirmPay(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('lottoInShop')
  async lottoInShop() {
    return this.lottoService.lottoInShop();
  }
  @UseGuards(JwtAuthGuard)
  @Get('lottoForSend')
  async lottoForSend() {
    return this.lottoService.lottoForSend();
  }
  @UseGuards(JwtAuthGuard)
  @Post('sendSave')
  async sendSave(@Body('data') dto: SendSaveDto) {
    return this.lottoService.sendSave(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('lottoIsBonus')
  async lottoIsBonus() {
    return this.lottoService.lottoIsBonus();
  }
  @UseGuards(JwtAuthGuard)
  @Get('lottoIsBonuslist')
  async lottoIsBonuslist() {
    return this.lottoService.lottoIsBonuslist();
  }
  @UseGuards(JwtAuthGuard)
  @Get('lottoIsBonusCheckAndList')
  async lottoIsBonusCheckAndList() {
    return this.lottoService.lottoIsBonusCheckAndList();
  }

  @UseGuards(JwtAuthGuard)
  @Put('changePrice')
  async changePrice(@Body() dto: ChangePriceDto) {
    return this.lottoService.changePrice(dto.lottos);
  }
}
