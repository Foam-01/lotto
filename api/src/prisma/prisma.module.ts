import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 🌟 ใส่ Global ไว้ จะได้ไม่ต้อง import PrismaModule บ่อยๆ
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
