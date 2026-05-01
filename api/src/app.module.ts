import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { CompanyController } from './company.controller';
import { LottoController } from './lotto.controller';
import { BonusController } from './bonus.controller';


@Module({
  imports: [
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController, UserController, CompanyController,
    
    LottoController, BonusController],
  providers: [AppService, AuthService, JwtStrategy],
})
export class AppModule {}
