import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 🌟 Import Modules ที่เราจัดระเบียบแล้ว
import { PrismaModule } from './prisma/prisma.module';
import { BillSaleModule } from './modules/bill-sale/bill-sale.module';
import { CompanyModule } from './modules/company/company.module';
import { BonusModule } from './modules/bonus/bonus.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LottoModule } from './modules/lotto/lotto.module';
import { BannerModule } from './modules/banner/banner.module'; // 🌟 อย่าลืมเพิ่ม BannerModule ด้วยนะครับ

@Module({
  imports: [
    PrismaModule,
    BillSaleModule,
    CompanyModule,
    BonusModule,
    AuthModule, // 🌟 เสียบปลั๊ก Auth
    UserModule, // 🌟 เสียบปลั๊ก User
    LottoModule,
    BannerModule, // 🌟 เสียบปลั๊ก Banner
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
