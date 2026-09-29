import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

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
    // 🔐 จำกัดจำนวน request ต่อ IP กันการยิงสุ่มรหัสผ่าน/ยิงถล่ม API (ค่าเริ่มต้น: 60 ครั้ง/นาที)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    BillSaleModule,
    CompanyModule,
    BonusModule,
    AuthModule, // 🌟 เสียบปลั๊ก Auth
    UserModule, // 🌟 เสียบปลั๊ก User
    LottoModule,
    BannerModule, // 🌟 เสียบปลั๊ก Banner
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
