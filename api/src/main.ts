import 'dotenv/config'; // 🔐 โหลดค่าจาก .env ก่อนทุกอย่าง (ต้องอยู่บรรทัดแรกสุด)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 🌟 เพิ่มบรรทัดนี้
import compression from 'compression';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛑 ตาข่ายนิรภัยสุดท้าย: ดักทุก error ที่ยังไม่ถูก catch ให้ response หน้าตาเดียวกันเสมอ
  // และไม่มีวันหลุด stack trace / ข้อความ error ดิบออกไปให้ client เห็น
  app.useGlobalFilters(new AllExceptionsFilter());

  // 🔐 ตั้งค่า HTTP Security Headers (X-Frame-Options, CSP พื้นฐาน ฯลฯ)
  app.use(helmet());

  // 🔐 จำกัด CORS ให้เหลือเฉพาะ origin ที่รู้จัก แทนการเปิดรับทุก origin
  // ตั้งค่าเพิ่มได้ผ่าน env CORS_ORIGIN (คั่นด้วย comma) เช่น "https://your-domain.com,https://your-app.vercel.app"
  const allowedOrigins = (
    process.env.CORS_ORIGIN ??
    'http://localhost:3000,http://localhost:3001'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: allowedOrigins });

  // 🌟 บีบอัด Response (gzip) ก่อนส่งออกไปให้ Client ลดขนาด payload ของ list/report API ที่ตอบกลับเป็น JSON ก้อนใหญ่
  app.use(compression());

  // 🌟 เปิดใช้งานระบบตรวจสอบข้อมูล (DTO) ทั้งระบบ
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

 await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();

// 🌟 ใช้ระบบตรวจสอบข้อมูล (DTO) ทั้งระบบ
