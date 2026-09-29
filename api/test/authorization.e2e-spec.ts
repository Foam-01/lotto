import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { hashPassword } from './../src/common/password.util';

// 🌟 ก่อนหน้านี้หลาย endpoint ของแอดมิน (user/company/banner/bill-sale/bonus และ
// บางส่วนของ lotto) ไม่มี JwtAuthGuard เลย ใครก็เรียกได้โดยไม่ต้องล็อกอิน
// ไฟล์นี้ล็อกพฤติกรรมที่ถูกต้องไว้: route ของแอดมินต้องถูกบล็อกด้วย 401 ถ้าไม่มี token
// ส่วน route สาธารณะของหน้าร้านลูกค้ายังต้องเรียกได้โดยไม่ต้องล็อกอินเหมือนเดิม
describe('Authorization across controllers (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: any;
  let validToken: string;

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      lotto: { findMany: jest.fn().mockResolvedValue([]) },
      banner: { findMany: jest.fn().mockResolvedValue([]) },
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

    const hashed = await hashPassword('secret123');
    prisma.user.findFirst.mockResolvedValue({
      id: 1,
      user: 'admin',
      level: 'admin',
      pwd: hashed,
    });
    const loginRes = await request(app.getHttpServer())
      .post('/api/user/login')
      .send({ usr: 'admin', pwd: 'secret123' });
    validToken = loginRes.body.token;
  });

  afterEach(async () => {
    await app.close();
  });

  const protectedRoutes: Array<[string, string]> = [
    ['get', '/api/lotto/list'],
    ['put', '/api/lotto/changePrice'],
    ['post', '/api/lotto/ConfirmPay'],
    ['get', '/api/lotto/billSale'],
    ['get', '/api/lotto/lottoInShop'],
    ['get', '/api/user/list'],
    ['post', '/api/company/create'],
    ['post', '/api/banner/create'],
    ['get', '/api/bonus/list'],
    ['post', '/api/billSale/TranferMoney'],
  ];

  describe.each(protectedRoutes)('%s %s', (method, path) => {
    it('rejects with 401 when no token is sent (admin-only route)', async () => {
      await (request(app.getHttpServer()) as any)
        [method](path)
        .expect(401);
    });
  });

  it('a valid token is accepted on an admin-only route (GET /api/lotto/list)', async () => {
    expect(typeof validToken).toBe('string');

    await request(app.getHttpServer())
      .get('/api/lotto/list')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });

  it('a valid token is accepted on GET /api/user/list', async () => {
    await request(app.getHttpServer())
      .get('/api/user/list')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });

  const publicRoutes: Array<[string, string]> = [
    ['get', '/api/lotto/listForSale'],
    ['get', '/api/banner/list'],
  ];

  describe.each(publicRoutes)('%s %s', (method, path) => {
    it('is reachable with no token at all (customer-facing route)', async () => {
      const res = await (request(app.getHttpServer()) as any)[method](path);
      expect(res.status).not.toBe(401);
    });
  });
});
