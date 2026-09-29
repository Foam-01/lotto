import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { hashPassword } from './../src/common/password.util';

// 🌟 ทดสอบ flow ล็อกอินแบบ end-to-end ผ่าน HTTP จริง (DTO validation, guard,
// การ hash/verify รหัสผ่าน) โดย mock เฉพาะ PrismaService (ขอบเขตฐานข้อมูล)
describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: {
    user: { findFirst: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ $connect: jest.fn(), ...prisma })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/user/login', () => {
    it('rejects an empty body before it ever reaches the service (DTO validation)', async () => {
      await request(app.getHttpServer())
        .post('/api/user/login')
        .send({})
        .expect(400);

      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('returns 401 for a wrong username/password', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/user/login')
        .send({ usr: 'nobody', pwd: 'wrong' })
        .expect(401);
    });

    it('returns a working JWT for correct credentials (happy path)', async () => {
      const hashed = await hashPassword('secret123');
      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        user: 'admin',
        level: 'admin',
        pwd: hashed,
      });

      const res = await request(app.getHttpServer())
        .post('/api/user/login')
        .send({ usr: 'admin', pwd: 'secret123' })
        .expect(201);

      expect(typeof res.body.token).toBe('string');
    });
  });

  describe('GET /api/user/info', () => {
    it('returns 401 when no Authorization header is sent', async () => {
      await request(app.getHttpServer()).get('/api/user/info').expect(401);
    });

    it('decodes the payload from a token obtained through a real login', async () => {
      const hashed = await hashPassword('secret123');
      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        user: 'admin',
        level: 'admin',
        pwd: hashed,
      });
      const loginRes = await request(app.getHttpServer())
        .post('/api/user/login')
        .send({ usr: 'admin', pwd: 'secret123' })
        .expect(201);

      const infoRes = await request(app.getHttpServer())
        .get('/api/user/info')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .expect(200);

      expect(infoRes.body.payload).toMatchObject({
        sub: 1,
        user: 'admin',
        level: 'admin',
      });
    });
  });
});
