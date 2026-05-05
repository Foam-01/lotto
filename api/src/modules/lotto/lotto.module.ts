import { Module } from '@nestjs/common';
import { LottoController } from './lotto.controller';
import { LottoService } from './lotto.service';

@Module({
  controllers: [LottoController],
  providers: [LottoService],
})
export class LottoModule {}
