import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { hashPassword } from '../../common/password.util';

function createPrismaMock() {
  return {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  } as any;
}

describe('UserService', () => {
  let service: UserService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new UserService(prisma);
  });

  describe('list', () => {
    it('never selects the pwd column (security-sensitive projection)', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.list();

      const args = prisma.user.findMany.mock.calls[0][0];
      expect(args.select).not.toHaveProperty('pwd');
      expect(args.select).toEqual({
        id: true,
        user: true,
        name: true,
        level: true,
        email: true,
        phone: true,
        address: true,
      });
      expect(args.orderBy).toEqual({ id: 'asc' });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('db down'));

      await expect(service.list()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    it('hashes the password before storing it (happy path)', async () => {
      prisma.user.create.mockResolvedValue({ id: 1, user: 'newstaff' });

      await service.create({
        user: 'newstaff',
        pwd: 'pass1234',
        level: 'staff',
      } as any);

      const args = prisma.user.create.mock.calls[0][0];
      expect(args.data.pwd).not.toBe('pass1234');
      expect(args.data.pwd).toMatch(/^\$2[aby]\$/);
      expect(args.data.user).toBe('newstaff');
    });

    it('wraps a duplicate-username failure as InternalServerErrorException', async () => {
      prisma.user.create.mockRejectedValue(new Error('unique constraint'));

      await expect(
        service.create({ user: 'dup', pwd: 'x', level: 'staff' } as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('edit', () => {
    it('re-hashes the password when a new one is provided', async () => {
      prisma.user.update.mockResolvedValue({ id: 1 });

      await service.edit(1, { pwd: 'new-password' } as any);

      const args = prisma.user.update.mock.calls[0][0];
      expect(args.data.pwd).not.toBe('new-password');
      expect(args.data.pwd).toMatch(/^\$2[aby]\$/);
    });

    it('leaves the stored password untouched when pwd is omitted (edge case)', async () => {
      prisma.user.update.mockResolvedValue({ id: 1 });

      await service.edit(1, { user: 'renamed' } as any);

      const args = prisma.user.update.mock.calls[0][0];
      expect(args.data).not.toHaveProperty('pwd');
      expect(args.data).toEqual({ user: 'renamed' });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.user.update.mockRejectedValue(new Error('not found'));

      await expect(service.edit(999, {} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('deletes a user (happy path)', async () => {
      prisma.user.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ id: 1 });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.user.delete.mockRejectedValue(new Error('not found'));

      await expect(service.remove(999)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('changePassword', () => {
    it('updates to a freshly hashed password once the old one is verified (happy path)', async () => {
      const oldHashed = await hashPassword('correct-old');
      prisma.user.findUnique.mockResolvedValue({ id: 1, pwd: oldHashed });
      prisma.user.update.mockResolvedValue({ id: 1 });

      await service.changePassword(1, 'correct-old', 'brand-new-password');

      const args = prisma.user.update.mock.calls[0][0];
      expect(args.where).toEqual({ id: 1 });
      expect(args.data.pwd).not.toBe('brand-new-password');
      expect(args.data.pwd).toMatch(/^\$2[aby]\$/);
    });

    it('rejects with BadRequestException when oldPassword is wrong (security fix verification)', async () => {
      const oldHashed = await hashPassword('correct-old');
      prisma.user.findUnique.mockResolvedValue({ id: 1, pwd: oldHashed });

      await expect(
        service.changePassword(1, 'totally-wrong-guess', 'new-password'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the user does not exist (error case)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword(404, 'old', 'new'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('wraps a DB failure during the update itself as InternalServerErrorException', async () => {
      const oldHashed = await hashPassword('correct-old');
      prisma.user.findUnique.mockResolvedValue({ id: 1, pwd: oldHashed });
      prisma.user.update.mockRejectedValue(new Error('db down'));

      await expect(
        service.changePassword(1, 'correct-old', 'new-password'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
