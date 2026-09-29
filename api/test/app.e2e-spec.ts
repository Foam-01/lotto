import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

// 🌟 AppModule ไม่มี AppController/AppService (demo scaffold) แล้ว มีแต่ Feature module
// จริงของระบบ (auth/user/lotto/...) ไฟล์นี้จึงทำหน้าที่เป็น "smoke test" ตรวจว่าทั้งแอป
// ประกอบร่างขึ้นมาได้จริงและ endpoint สาธารณะพื้นฐานยังตอบสนอง โดย stub PrismaService
// แทนของจริง เพื่อไม่ให้ app.init() พยายามต่อ Postgres จริง (ซึ่งต้องใช้ DATABASE_URL)
describe('AppModule (e2e smoke test)', () => {
  let app: INestApplication<App>;
  let prisma: { lotto: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { lotto: { findMany: jest.fn().mockResolvedValue([]) } };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('boots the whole application (every feature module wires up)', () => {
    expect(app).toBeDefined();
  });

  it('serves a public route without requiring auth (GET /api/lotto/listForSale)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/lotto/listForSale')
      .expect(200);

    expect(res.body).toEqual({ results: [] });
  });

  it('returns 404 for a route that does not exist', async () => {
    await request(app.getHttpServer()).get('/api/does-not-exist').expect(404);
  });
});
