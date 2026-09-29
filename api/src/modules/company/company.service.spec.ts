import { InternalServerErrorException } from '@nestjs/common';
import { CompanyService } from './company.service';

function createPrismaMock() {
  return {
    company: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  } as any;
}

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new CompanyService(prisma);
  });

  describe('createCompany', () => {
    it('creates a company from the dto (happy path)', async () => {
      const dto = { name: 'แผงแมวส้ม', address: 'กรุงเทพ', phone: '021234567' };
      prisma.company.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.createCompany(dto as any);

      expect(prisma.company.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual({ id: 1, ...dto });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.company.create.mockRejectedValue(new Error('duplicate'));

      await expect(
        service.createCompany({
          name: 'x',
          address: 'x',
          phone: 'x',
        } as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getCompanyInfo', () => {
    it('returns the first company row', async () => {
      prisma.company.findFirst.mockResolvedValue({ id: 1, name: 'x' });

      const result = await service.getCompanyInfo();

      expect(result).toEqual({ id: 1, name: 'x' });
    });

    it('returns null when no company has been set up yet (boundary case)', async () => {
      prisma.company.findFirst.mockResolvedValue(null);

      const result = await service.getCompanyInfo();

      expect(result).toBeNull();
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.company.findFirst.mockRejectedValue(new Error('db down'));

      await expect(service.getCompanyInfo()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateCompany', () => {
    it('updates by id (happy path)', async () => {
      const dto = { name: 'ใหม่', address: 'ใหม่', phone: '000' };
      prisma.company.update.mockResolvedValue({ id: 1, ...dto });

      const result = await service.updateCompany(1, dto as any);

      expect(prisma.company.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
      expect(result).toEqual({ id: 1, ...dto });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.company.update.mockRejectedValue(new Error('not found'));

      await expect(
        service.updateCompany(999, { name: 'x', address: 'x', phone: 'x' } as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
