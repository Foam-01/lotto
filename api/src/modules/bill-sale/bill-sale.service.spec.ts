import { InternalServerErrorException } from '@nestjs/common';
import { BillSaleService } from './bill-sale.service';

function createPrismaMock() {
  return {
    billSale: { update: jest.fn() },
    billSaleDetail: { findMany: jest.fn() },
    lottoIsBonus: { findMany: jest.fn() },
  } as any;
}

describe('BillSaleService', () => {
  let service: BillSaleService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new BillSaleService(prisma);
  });

  describe('transferMoney', () => {
    it('stores the transfer date/time/price against the bill (happy path)', async () => {
      prisma.billSale.update.mockResolvedValue({});

      const result = await service.transferMoney({
        billSaleId: 1,
        transferMoneyDate: '2026-01-05',
        transferMoneyTime: '09:30',
        price: 500,
      } as any);

      expect(prisma.billSale.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          transferMoneyTime: '09:30',
          transferMoneyDate: new Date('2026-01-05'),
          price: 500,
        },
      });
      expect(result).toEqual({ message: 'success' });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.billSale.update.mockRejectedValue(new Error('not found'));

      await expect(
        service.transferMoney({
          billSaleId: 999,
          transferMoneyDate: '2026-01-05',
          transferMoneyTime: '09:30',
          price: 500,
        } as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deliverMoney', () => {
    it('stores the delivery date/price against the bill (happy path)', async () => {
      prisma.billSale.update.mockResolvedValue({});

      const result = await service.deliverMoney({
        billSaleId: 2,
        deliverDate: '2026-01-06',
        price: 300,
      } as any);

      expect(prisma.billSale.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { deliverDate: new Date('2026-01-06'), price: 300 },
      });
      expect(result).toEqual({ message: 'success' });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.billSale.update.mockRejectedValue(new Error('not found'));

      await expect(
        service.deliverMoney({
          billSaleId: 999,
          deliverDate: '2026-01-06',
          price: 300,
        } as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getIncome', () => {
    it('queries paid bills within the date range (happy path)', async () => {
      prisma.billSaleDetail.findMany.mockResolvedValue([{ id: 1 }]);

      const fromDate = '2026-01-01';
      const toDate = '2026-01-31';
      const result = await service.getIncome({ fromDate, toDate } as any);

      expect(prisma.billSaleDetail.findMany).toHaveBeenCalledWith({
        where: {
          billSale: {
            payDate: {
              not: null,
              gte: new Date(fromDate).toISOString(),
              lte: new Date(toDate).toISOString(),
            },
          },
        },
        include: { lotto: true, billSale: true },
      });
      expect(result).toEqual({ results: [{ id: 1 }] });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.billSaleDetail.findMany.mockRejectedValue(new Error('db down'));

      await expect(
        service.getIncome({
          fromDate: '2026-01-01',
          toDate: '2026-01-31',
        } as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getProfit', () => {
    it('sums ticket sales and won-prize income into a grand total, net of ticket cost (happy path)', async () => {
      prisma.billSaleDetail.findMany.mockResolvedValue([
        { price: 80, lotto: { cost: 70 } },
        { price: 100, lotto: { cost: 70 } },
        { price: null, lotto: { cost: 70 } }, // ราคาไม่ระบุ ต้องนับเป็น 0 ไม่ใช่ throw
      ]);
      prisma.lottoIsBonus.findMany.mockResolvedValue([
        { BonusResultDetail: { price: 2000 } },
        { BonusResultDetail: null }, // แถวที่ยังไม่ผูกกับผลรางวัล ต้องนับเป็น 0
      ]);

      const result = await service.getProfit({
        fromDate: '2026-01-01',
        toDate: '2026-01-31',
      } as any);

      // totalSale 180 - totalCost 210 (3 ใบ x 70) = ขาดทุนจากการขาย -30 แต่รวมเงินรางวัลแล้วยังกำไรอยู่
      expect(result.summary).toEqual({
        totalSale: 180,
        totalCost: 210,
        profitFromSale: -30,
        totalBonus: 2000,
        grandTotal: 1970,
      });
    });

    it('returns zero totals when there is no data in range (boundary case)', async () => {
      prisma.billSaleDetail.findMany.mockResolvedValue([]);
      prisma.lottoIsBonus.findMany.mockResolvedValue([]);

      const result = await service.getProfit({
        fromDate: '2026-01-01',
        toDate: '2026-01-31',
      } as any);

      expect(result.summary).toEqual({
        totalSale: 0,
        totalCost: 0,
        profitFromSale: 0,
        totalBonus: 0,
        grandTotal: 0,
      });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.billSaleDetail.findMany.mockRejectedValue(new Error('db down'));

      await expect(
        service.getProfit({
          fromDate: '2026-01-01',
          toDate: '2026-01-31',
        } as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
