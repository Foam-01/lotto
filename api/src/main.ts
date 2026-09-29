import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 🌟 เพิ่มบรรทัดนี้
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // 🌟 บีบอัด Response (gzip) ก่อนส่งออกไปให้ Client ลดขนาด payload ของ list/report API ที่ตอบกลับเป็น JSON ก้อนใหญ่
  app.use(compression());

  // 🌟 เปิดใช้งานระบบตรวจสอบข้อมูล (DTO) ทั้งระบบ
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// 🌟 ใช้ระบบตรวจสอบข้อมูล (DTO) ทั้งระบบ