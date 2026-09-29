import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { BonusService } from './bonus.service';

// 🌟 mock เฉพาะขอบเขตภายนอกจริง ๆ: axios (3rd-party API) และ Prisma (DB)
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function createPrismaMock() {
  return {
    bonusResultDetail: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      createMany: jest.fn(),
      groupBy: jest.fn(),
    },
    billSaleDetail: {
      findMany: jest.fn(),
    },
    billSaleDetailIsBonus: {
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
    lotto: {
      updateMany: jest.fn(),
    },
  } as any;
}

// ผลรางวัลจำลองตามรูปแบบจริงของ GLO (www.glo.or.th/api/lottery/getLatestLottery)
function fakeLatestDraw(isoDate = '2026-04-16') {
  const group = (price: string, values: string[]) => ({
    price,
    number: values.map((value, i) => ({ round: i + 1, value })),
  });

  return {
    data: {
      response: {
        date: isoDate,
        data: {
          first: group('6000000', ['123456']),
          second: group('200000', ['111111', '222222']),
          third: group('80000', ['333333', '444444']),
          fourth: group('40000', ['555555', '666666']),
          fifth: group('20000', ['777777', '888888']),
          near1: group('100000', ['123455', '123457']),
          last2: group('2000', ['34']),
          last3f: group('4000', ['123', '456']),
          last3b: group('4000', ['789', '012']),
        },
      },
    },
  };
}

describe('BonusService', () => {
  let service: BonusService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new BonusService(prisma);
    jest.clearAllMocks();
  });

  describe('getBonus', () => {
    it('does not re-insert when the round is already stored (dedup / no-op case)', async () => {
      mockedAxios.post.mockResolvedValue(fakeLatestDraw());
      prisma.bonusResultDetail.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.getBonus();

      expect(prisma.bonusResultDetail.createMany).not.toHaveBeenCalled();
      expect(result.status).toBe('success');
      expect(result.message).toContain('ไม่บันทึกซ้ำ');
    });

    it('flattens prizes + running numbers into rows and stores them (happy path)', async () => {
      mockedAxios.post.mockResolvedValue(fakeLatestDraw());
      prisma.bonusResultDetail.findMany.mockResolvedValue([]);

      const result = await service.getBonus();

      expect(prisma.bonusResultDetail.createMany).toHaveBeenCalledTimes(1);
      const inserted = prisma.bonusResultDetail.createMany.mock.calls[0][0].data;
      expect(inserted).toHaveLength(16); // 1+2+2+2+2+2 (prizes+near1) + 1+2+2 (last2/last3f/last3b)
      expect(inserted).toContainEqual({
        number: '123456',
        price: 6000000,
        bonusDate: '16 เมษายน 2569',
      });
      expect(result.lotto_result).toEqual({
        prize1: '123456',
        prize1Near: ['123455', '123457'],
        prize2: ['111111', '222222'],
        prize3: ['333333', '444444'],
        prize4: ['555555', '666666'],
        prize5: ['777777', '888888'],
        front3: ['123', '456'],
        back3: ['789', '012'],
        back2: '34',
      });
    });

    it('wraps a network/API failure as InternalServerErrorException (timeout/error case)', async () => {
      mockedAxios.post.mockRejectedValue(new Error('timeout of 5000ms exceeded'));

      await expect(service.getBonus()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('wraps an unexpected/malformed upstream payload as InternalServerErrorException (error case)', async () => {
      mockedAxios.post.mockResolvedValue({ data: { response: { date: 'x' } } }); // no data field
      prisma.bonusResultDetail.findMany.mockResolvedValue([]);

      await expect(service.getBonus()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('list', () => {
    it('groups by round and strips down to { bonusDate } rows', async () => {
      prisma.bonusResultDetail.groupBy.mockResolvedValue([
        { bonusDate: '16 เมษายน 2569', _max: { id: 20 } },
        { bonusDate: '1 เมษายน 2569', _max: { id: 5 } },
      ]);

      const result = await service.list();

      expect(prisma.bonusResultDetail.groupBy).toHaveBeenCalledWith({
        by: ['bonusDate'],
        _max: { id: true },
        orderBy: { _max: { id: 'desc' } },
      });
      expect(result).toEqual({
        results: [{ bonusDate: '16 เมษายน 2569' }, { bonusDate: '1 เมษายน 2569' }],
      });
    });
  });

  describe('listDetail', () => {
    it('returns prizes for one round ordered by price desc', async () => {
      prisma.bonusResultDetail.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.listDetail('16 เมษายน 2569');

      expect(prisma.bonusResultDetail.findMany).toHaveBeenCalledWith({
        where: { bonusDate: '16 เมษายน 2569' },
        orderBy: { price: 'desc' },
      });
      expect(result).toEqual({ results: [{ id: 1 }] });
    });
  });

  describe('checkBonus', () => {
    it('matches on the last 2 digits (เลขท้าย 2 ตัว)', async () => {
      prisma.billSaleDetail.findMany.mockResolvedValue([
        { id: 1, lotto: { id: 1, numbers: '999934' } },
      ]);
      prisma.bonusResultDetail.findFirst.mockResolvedValue({
        bonusDate: '16 เมษายน 2569',
      });
      prisma.bonusResultDetail.findMany.mockResolvedValue([
        { id: 100, number: '34' },
      ]);
      prisma.billSaleDetailIsBonus.findMany.mockResolvedValue([]);

      await service.checkBonus();

      expect(prisma.billSaleDetailIsBonus.createMany).toHaveBeenCalledWith({
        data: [{ billSaleDetailId: 1, bonusResultDetailId: 100 }],
        skipDuplicates: true,
      });
    });

    it('matches on the front or back 3 digits (เลขหน้า/ท้าย 3 ตัว)', async () => {
      prisma.billSaleDetail.findMany.mockResolvedValue([
        { id: 1, lotto: { id: 1, numbers: '123999' } }, // front 3 match
        { id: 2, lotto: { id: 2, numbers: '999456' } }, // back 3 match
      ]);
      prisma.bonusResultDetail.findFirst.mockResolvedValue({
        bonusDate: '16 เมษายน 2569',
      });
      prisma.bonusResultDetail.findMany.mockResolvedValue([
        { id: 200, number: '123' },
        { id: 201, number: '456' },
      ]);
      prisma.billSaleDetailIsBonus.findMany.mockResolvedValue([]);

      await service.checkBonus();

      const inserted = prisma.billSaleDetailIsBonus.createMany.mock.calls[0][0]
        .data;
      expect(inserted).toEqual(
        expect.arrayContaining([
          { billSaleDetailId: 1, bonusResultDetailId: 200 },
          { billSaleDetailId: 2, bonusResultDetailId: 201 },
        ]),
      );
    });

    it('matches on the exact 6-digit number (รางวัลตรงเลขเต็ม)', async () => {
      prisma.billSaleDetail.findMany.mockResolvedValue([
        { id: 1, lotto: { id: 1, numbers: '123456' } },
      ]);
      prisma.bonusResultDetail.findFirst.mockResolvedValue({
        bonusDate: '16 เมษายน 2569',
      });
      prisma.bonusResultDetail.findMany.mockResolvedValue([
        { id: 300, number: '123456' },
      ]);
      prisma.billSaleDetailIsBonus.findMany.mockResolvedValue([]);

      await service.checkBonus();

      expect(prisma.billSaleDetailIsBonus.createMany).toHaveBeenCalledWith({
        data: [{ billSaleDetailId: 1, bonusResultDetailId: 300 }],
        skipDuplicates: true,
      });
    });

    it('does nothing when there is no match (no-match case)', async () => {
      prisma.billSaleDetail.findMany.mockResolvedValue([
        { id: 1, lotto: { id: 1, numbers: '111111' } },
      ]);
      prisma.bonusResultDetail.findFirst.mockResolvedValue({
        bonusDate: '16 เมษายน 2569',
      });
      prisma.bonusResultDetail.findMany.mockResolvedValue([
        { id: 400, number: '999999' },
      ]);
      prisma.billSaleDetailIsBonus.findMany.mockResolvedValue([]);

      await service.checkBonus();

      expect(prisma.billSaleDetailIsBonus.createMany).not.toHaveBeenCalled();
      // แต่ยัง flag ว่าตรวจแล้ว เพื่อไม่ต้องตรวจซ้ำในรอบถัดไป
      expect(prisma.lotto.updateMany).toHaveBeenCalledWith({
        data: { isCheckBonus: true },
        where: { id: { in: [1] } },
      });
    });

    it('does nothing at all when there are no unchecked paid tickets (empty edge case)', async () => {
      prisma.billSaleDetail.findMany.mockResolvedValue([]);
      prisma.bonusResultDetail.findFirst.mockResolvedValue(null);
      prisma.bonusResultDetail.findMany.mockResolvedValue([]);
      prisma.billSaleDetailIsBonus.findMany.mockResolvedValue([]);

      await service.checkBonus();

      expect(prisma.billSaleDetailIsBonus.createMany).not.toHaveBeenCalled();
      expect(prisma.lotto.updateMany).not.toHaveBeenCalled();
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.billSaleDetail.findMany.mockRejectedValue(new Error('db down'));

      await expect(service.checkBonus()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
