import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { hashPassword } from '../../common/password.util';

// 🌟 mock เฉพาะ Prisma (ขอบเขตของฐานข้อมูล) เท่านั้น
// JwtService และการ hash/verify รหัสผ่าน (bcrypt) ใช้ของจริงเพื่อพิสูจน์พฤติกรรมจริง
describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findFirst: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };
  let jwtService: JwtService;

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    jwtService = new JwtService({
      secret: 'test-secret',
      signOptions: { expiresIn: '1h' },
    });
    service = new AuthService(prisma as any, jwtService);
  });

  describe('login', () => {
    it('returns a signed token when the bcrypt hash matches (happy path)', async () => {
      const hashed = await hashPassword('secret');
      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        user: 'admin',
        level: 'admin',
        pwd: hashed,
      });

      const result = await service.login({ usr: 'admin', pwd: 'secret' });

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { user: 'admin' },
      });
      const decoded: any = jwtService.verify(result.token);
      expect(decoded).toMatchObject({ sub: 1, user: 'admin', level: 'admin' });
      // รหัสผ่านที่ hash แล้ว ไม่ต้อง migrate ซ้ำ
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('migrates a legacy plain-text password to bcrypt right after a successful login', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 2,
        user: 'legacy',
        level: 'staff',
        pwd: 'plain-text-secret', // บัญชีเก่าก่อนเปลี่ยนมาใช้ bcrypt
      });

      await service.login({ usr: 'legacy', pwd: 'plain-text-secret' });

      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      const [{ where, data }] = prisma.user.update.mock.calls[0];
      expect(where).toEqual({ id: 2 });
      expect(data.pwd).not.toBe('plain-text-secret');
      expect(data.pwd).toMatch(/^\$2[aby]\$/); // เป็น bcrypt hash แล้ว
    });

    it('throws UnauthorizedException when the password is wrong', async () => {
      const hashed = await hashPassword('correct');
      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        user: 'admin',
        pwd: hashed,
      });

      await expect(
        service.login({ usr: 'admin', pwd: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the username does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ usr: 'nobody', pwd: 'whatever' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getInfo', () => {
    it('decodes a valid Bearer token', async () => {
      const token = jwtService.sign({ sub: 7, user: 'bob', level: 'staff' });

      const result = await service.getInfo(`Bearer ${token}`);

      expect(result.payload).toMatchObject({
        sub: 7,
        user: 'bob',
        level: 'staff',
      });
    });

    it('throws UnauthorizedException for a malformed token', async () => {
      await expect(service.getInfo('Bearer not-a-real-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for an expired token (boundary case)', async () => {
      const token = jwtService.sign({ sub: 1 }, { expiresIn: -1 });

      await expect(service.getInfo(`Bearer ${token}`)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the Authorization header is missing', async () => {
      await expect(service.getInfo(undefined as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUserById', () => {
    it('delegates straight to prisma.user.findUnique', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 5, user: 'carol' });

      const result = await service.validateUserById(5);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(result).toEqual({ id: 5, user: 'carol' });
    });
  });
});
