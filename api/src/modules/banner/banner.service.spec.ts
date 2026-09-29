import { InternalServerErrorException } from '@nestjs/common';
import { BannerService } from './banner.service';

function createPrismaMock() {
  return {
    banner: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;
}

describe('BannerService', () => {
  let service: BannerService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new BannerService(prisma);
  });

  describe('list', () => {
    it('orders by sequence asc, then newest id first', async () => {
      prisma.banner.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.list();

      expect(prisma.banner.findMany).toHaveBeenCalledWith({
        orderBy: [{ sequence: 'asc' }, { id: 'desc' }],
      });
      expect(result).toEqual([{ id: 1 }]);
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.banner.findMany.mockRejectedValue(new Error('db down'));

      await expect(service.list()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    it('creates a banner from the dto (happy path)', async () => {
      const dto = { name: 'promo', src: '/img.png' };
      prisma.banner.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto as any);

      expect(prisma.banner.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual({ id: 1, ...dto });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.banner.create.mockRejectedValue(new Error('bad data'));

      await expect(
        service.create({ name: 'x', src: 'x' } as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('edit', () => {
    it('updates by id (happy path)', async () => {
      prisma.banner.update.mockResolvedValue({ id: 1, isActive: false });

      const result = await service.edit(1, { isActive: false } as any);

      expect(prisma.banner.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result).toEqual({ id: 1, isActive: false });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.banner.update.mockRejectedValue(new Error('not found'));

      await expect(service.edit(999, {} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('deletes by id (happy path)', async () => {
      prisma.banner.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(prisma.banner.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ id: 1 });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.banner.delete.mockRejectedValue(new Error('not found'));

      await expect(service.remove(999)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
