import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LottoService } from './lotto.service';

// 🌟 mock เฉพาะ PrismaService (ขอบเขตฐานข้อมูล) เท่านั้น ตรรกะทางธุรกิจข้างในยังรันจริง
function createPrismaMock() {
  const prisma: any = {
    lotto: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    billSale: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    billSaleDetail: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    billSaleForSend: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    bonusResultDetail: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    lottoIsBonus: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  };
  // เลียนแบบ Prisma จริง: รับ callback (interactive tx) หรือ array ของ promise (batch) ก็ได้
  prisma.$transaction.mockImplementation((arg: any) =>
    typeof arg === 'function' ? arg(prisma) : Promise.all(arg),
  );
  return prisma;
}

describe('LottoService', () => {
  let service: LottoService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new LottoService(prisma);
  });

  describe('create', () => {
    it('wraps the created row in { result } (happy path)', async () => {
      prisma.lotto.create.mockResolvedValue({ id: 1, numbers: '123456' });

      const result = await service.create({ numbers: '123456' } as any);

      expect(prisma.lotto.create).toHaveBeenCalledWith({
        data: { numbers: '123456' },
      });
      expect(result).toEqual({ result: { id: 1, numbers: '123456' } });
    });

    it('turns a DB error into InternalServerErrorException (error case)', async () => {
      prisma.lotto.create.mockRejectedValue(new Error('unique constraint'));

      await expect(service.create({} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('list', () => {
    it('orders by inSale desc and wraps in { result }', async () => {
      prisma.lotto.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.list();

      expect(prisma.lotto.findMany).toHaveBeenCalledWith({
        orderBy: { inSale: 'desc' },
      });
      expect(result).toEqual({ result: [{ id: 1 }] });
    });
  });

  describe('listForSale', () => {
    it('excludes lottos already on a paid bill', async () => {
      prisma.lotto.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.listForSale();

      expect(prisma.lotto.findMany).toHaveBeenCalledWith({
        where: {
          billSaleDetails: { none: { billSale: { payDate: { not: null } } } },
        },
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual({ results: [{ id: 1 }] });
    });

    it('maps a query failure to InternalServerErrorException', async () => {
      prisma.lotto.findMany.mockRejectedValue(new Error('db down'));

      await expect(service.listForSale()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('deletes by id (happy path)', async () => {
      prisma.lotto.delete.mockResolvedValue({ id: 9 });

      const result = await service.remove(9);

      expect(prisma.lotto.delete).toHaveBeenCalledWith({ where: { id: 9 } });
      expect(result).toEqual({ result: { id: 9 } });
    });

    it('throws InternalServerErrorException when the row does not exist', async () => {
      prisma.lotto.delete.mockRejectedValue(new Error('Record not found'));

      await expect(service.remove(404)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('edit', () => {
    it('updates by id (happy path)', async () => {
      prisma.lotto.update.mockResolvedValue({ id: 1, sale: 90 });

      const result = await service.edit(1, { sale: 90 } as any);

      expect(prisma.lotto.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { sale: 90 },
      });
      expect(result).toEqual({ result: { id: 1, sale: 90 } });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.lotto.update.mockRejectedValue(new Error('nope'));

      await expect(service.edit(1, {} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('search', () => {
    it('searches by startsWith when position is "start"', async () => {
      prisma.lotto.findMany.mockResolvedValue([]);

      await service.search({ numbers: '12', position: 'start' });

      expect(prisma.lotto.findMany).toHaveBeenCalledWith({
        where: { numbers: { startsWith: '12' } },
      });
    });

    it('falls back to endsWith for any other position value (boundary/default case)', async () => {
      prisma.lotto.findMany.mockResolvedValue([]);

      await service.search({ numbers: '34', position: 'not-a-real-option' });

      expect(prisma.lotto.findMany).toHaveBeenCalledWith({
        where: { numbers: { endsWith: '34' } },
      });
    });
  });

  describe('confirmBuy', () => {
    const dto = {
      customerName: 'Somchai',
      customerPhone: '0899999999',
      customerAddress: '',
      carts: [{ item: { id: 1 } }, { item: { id: 2 } }],
    };

    it('looks up all cart prices in a single query and creates the bill + details (happy path)', async () => {
      prisma.lotto.findMany.mockResolvedValue([
        { id: 1, sale: 80 },
        { id: 2, sale: 100 },
      ]);
      prisma.billSaleDetail.findMany.mockResolvedValue([]); // ยังไม่มีใบไหนถูกจองไปก่อน
      prisma.billSale.create.mockResolvedValue({ id: 55 });

      const result = await service.confirmBuy(dto as any);

      expect(prisma.lotto.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
      });
      expect(prisma.billSaleDetail.createMany).toHaveBeenCalledWith({
        data: [
          { billSaleId: 55, lottoId: 1, price: 80 },
          { billSaleId: 55, lottoId: 2, price: 100 },
        ],
      });
      expect(result).toEqual({ message: 'success' });
    });

    it('prices a cart item as 0 when the lotto id is not found (edge case)', async () => {
      prisma.lotto.findMany.mockResolvedValue([{ id: 1, sale: 80 }]); // lotto id 2 missing
      prisma.billSaleDetail.findMany.mockResolvedValue([]);
      prisma.billSale.create.mockResolvedValue({ id: 56 });

      await service.confirmBuy(dto as any);

      expect(prisma.billSaleDetail.createMany).toHaveBeenCalledWith({
        data: [
          { billSaleId: 56, lottoId: 1, price: 80 },
          { billSaleId: 56, lottoId: 2, price: 0 },
        ],
      });
    });

    it('wraps any failure as InternalServerErrorException', async () => {
      prisma.lotto.findMany.mockResolvedValue([]);
      prisma.billSaleDetail.findMany.mockResolvedValue([]);
      prisma.billSale.create.mockRejectedValue(new Error('db error'));

      await expect(service.confirmBuy(dto as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('refuses to sell a lotto that another customer already reserved (conflict case)', async () => {
      prisma.lotto.findMany.mockResolvedValue([
        { id: 1, sale: 80 },
        { id: 2, sale: 100 },
      ]);
      prisma.billSaleDetail.findMany.mockResolvedValue([{ lottoId: 2 }]);

      await expect(service.confirmBuy(dto as any)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.billSale.create).not.toHaveBeenCalled();
    });
  });

  describe('getBillSale', () => {
    it('includes nested lotto details ordered by id desc', async () => {
      prisma.billSale.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.getBillSale();

      expect(prisma.billSale.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          createdDate: true,
          customerName: true,
          customerPhone: true,
          customerAddress: true,
          payDate: true,
          payTime: true,
          billSaleDetail: {
            select: { price: true, lotto: { select: { numbers: true } } },
          },
        },
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual({ result: [{ id: 1 }] });
    });
  });

  describe('removeBill', () => {
    it('deletes bill details before the bill itself, in one transaction (happy path)', async () => {
      prisma.billSaleDetail.deleteMany.mockResolvedValue({ count: 2 });
      prisma.billSale.delete.mockResolvedValue({ id: 5 });

      const result = await service.removeBill(5);

      expect(prisma.billSaleDetail.deleteMany).toHaveBeenCalledWith({
        where: { billSaleId: 5 },
      });
      expect(prisma.billSale.delete).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ message: 'success' });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.billSaleDetail.deleteMany.mockRejectedValue(new Error('fk error'));
      prisma.billSale.delete.mockResolvedValue({});

      await expect(service.removeBill(5)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('confirmPay', () => {
    const dto = {
      billSaleId: 5,
      payAlertDate: '2026-01-01',
      payDate: '2026-01-02',
      payRemark: 'ok',
      payTime: '10:00',
    };

    it('updates the bill then marks every lotto in it as sold, inside one transaction (happy path)', async () => {
      prisma.billSale.update.mockResolvedValue({ id: 5 });
      prisma.billSaleDetail.findMany.mockResolvedValue([
        { lottoId: 1 },
        { lottoId: 2 },
      ]);
      prisma.lotto.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.confirmPay(dto as any);

      expect(prisma.billSale.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          payAlertDate: new Date(dto.payAlertDate),
          payDate: new Date(dto.payDate),
          payRemark: 'ok',
          payTime: '10:00',
        },
      });
      expect(prisma.billSaleDetail.findMany).toHaveBeenCalledWith({
        where: { billSaleId: 5 },
      });
      expect(prisma.lotto.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
        data: { inSale: true },
      });
      expect(result).toEqual({ message: 'success' });
    });

    it('wraps a failure inside the transaction as InternalServerErrorException', async () => {
      prisma.billSale.update.mockRejectedValue(new Error('bill not found'));

      await expect(service.confirmPay(dto as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('lottoInShop / lottoForSend', () => {
    it('lottoInShop returns paid bills with no delivery address', async () => {
      prisma.billSale.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.lottoInShop();

      expect(prisma.billSale.findMany).toHaveBeenCalledWith({
        where: {
          payDate: { not: null },
          OR: [{ customerAddress: '' }, { customerAddress: null }],
        },
        orderBy: { id: 'desc' },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          payDate: true,
          payTime: true,
          billSaleDetail: {
            select: { price: true, lotto: { select: { numbers: true } } },
          },
        },
      });
      expect(result).toEqual({ results: [{ id: 1 }] });
    });

    it('lottoForSend returns paid bills that do have a delivery address', async () => {
      prisma.billSale.findMany.mockResolvedValue([{ id: 2 }]);

      const result = await service.lottoForSend();

      expect(prisma.billSale.findMany).toHaveBeenCalledWith({
        where: { payDate: { not: null }, customerAddress: { not: '' } },
        orderBy: { id: 'desc' },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          customerAddress: true,
          billSaleDetail: {
            select: { price: true, lotto: { select: { numbers: true } } },
          },
          billSaleForSends: { select: { sendDate: true, price: true } },
        },
      });
      expect(result).toEqual({ results: [{ id: 2 }] });
    });
  });

  describe('sendSave', () => {
    it('creates a send record the first time (happy path)', async () => {
      prisma.billSaleForSend.findMany.mockResolvedValue([]);
      prisma.billSaleForSend.create.mockResolvedValue({ id: 1 });

      const result = await service.sendSave({ billSaleId: 1 } as any);

      expect(prisma.billSaleForSend.create).toHaveBeenCalledWith({
        data: { billSaleId: 1 },
      });
      expect(result).toEqual({ message: 'success' });
    });

    it('refuses to duplicate a send record for the same bill (edge case)', async () => {
      prisma.billSaleForSend.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.sendSave({ billSaleId: 1 } as any);

      expect(prisma.billSaleForSend.create).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'data exist' });
    });
  });

  describe('lottoIsBonus', () => {
    it('reports "no results yet" when there is no bonus round in the system (edge case)', async () => {
      prisma.bonusResultDetail.findFirst.mockResolvedValue(null);

      const result = await service.lottoIsBonus();

      expect(result).toEqual({ message: 'ยังไม่มีผลรางวัลในระบบ' });
      expect(prisma.lottoIsBonus.createMany).not.toHaveBeenCalled();
    });

    it('does nothing when no in-stock lotto matches the latest round (no-match case)', async () => {
      prisma.bonusResultDetail.findFirst.mockResolvedValue({
        id: 1,
        bonusDate: '2026-01-01',
      });
      prisma.bonusResultDetail.findMany.mockResolvedValue([
        { id: 10, number: '999999' },
      ]);
      prisma.lotto.findMany.mockResolvedValue([{ numbers: '111111' }]);

      const result = await service.lottoIsBonus();

      expect(result).toEqual({ message: 'success' });
      expect(prisma.lottoIsBonus.createMany).not.toHaveBeenCalled();
    });

    it('lets the DB unique constraint skip duplicates instead of pre-checking in app code (dedup logic)', async () => {
      prisma.bonusResultDetail.findFirst.mockResolvedValue({
        id: 1,
        bonusDate: '2026-01-01',
      });
      prisma.bonusResultDetail.findMany.mockResolvedValue([
        { id: 10, number: '111111' }, // matches stock -> new
        { id: 11, number: '222222' }, // matches stock -> already saved in DB
      ]);
      prisma.lotto.findMany.mockResolvedValue([
        { numbers: '111111' },
        { numbers: '222222' },
      ]);

      const result = await service.lottoIsBonus();

      // ส่งทั้งคู่ไปพร้อมกัน แล้วให้ unique constraint ที่ฐานข้อมูล (skipDuplicates) เป็นคนกันซ้ำแทน
      // เพื่อความ atomic ใต้ concurrency (ดูคอมเมนต์ใน lotto.service.ts)
      expect(prisma.lottoIsBonus.createMany).toHaveBeenCalledWith({
        data: [{ bonusResultDetailId: 10 }, { bonusResultDetailId: 11 }],
        skipDuplicates: true,
      });
      expect(result).toEqual({ message: 'success' });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.bonusResultDetail.findFirst.mockRejectedValue(new Error('down'));

      await expect(service.lottoIsBonus()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('lottoIsBonuslist', () => {
    it('orders results by id desc with the bonus detail included', async () => {
      prisma.lottoIsBonus.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.lottoIsBonuslist();

      expect(prisma.lottoIsBonus.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
        select: {
          id: true,
          BonusResultDetail: {
            select: { number: true, price: true, bonusDate: true },
          },
        },
      });
      expect(result).toEqual({ results: [{ id: 1 }] });
    });
  });

  describe('lottoIsBonusCheckAndList', () => {
    it('returns the existing list as-is when there is no bonus round yet (edge case)', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      prisma.lotto.findMany.mockResolvedValue([]);
      prisma.lottoIsBonus.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.lottoIsBonusCheckAndList();

      expect(prisma.lottoIsBonus.createMany).not.toHaveBeenCalled();
      expect(result).toEqual({ results: [{ id: 1 }] });
    });

    it('returns the existing list unchanged when nothing in stock matches the latest round (no-match case)', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 10, number: '999999' }]);
      prisma.lotto.findMany.mockResolvedValue([{ numbers: '111111' }]);
      prisma.lottoIsBonus.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.lottoIsBonusCheckAndList();

      expect(prisma.lottoIsBonus.createMany).not.toHaveBeenCalled();
      // ไม่มีอะไรเปลี่ยน จึงไม่ต้อง query รายการซ้ำ (findMany ของ lottoIsBonus ถูกเรียกแค่ครั้งเดียว)
      expect(prisma.lottoIsBonus.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ results: [{ id: 1 }] });
    });

    it('skips the extra re-fetch when every match already existed (all-duplicates case)', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 10, number: '111111' }]);
      prisma.lotto.findMany.mockResolvedValue([{ numbers: '111111' }]);
      prisma.lottoIsBonus.findMany.mockResolvedValue([{ id: 1 }]);
      prisma.lottoIsBonus.createMany.mockResolvedValue({ count: 0 });

      const result = await service.lottoIsBonusCheckAndList();

      expect(prisma.lottoIsBonus.createMany).toHaveBeenCalledWith({
        data: [{ bonusResultDetailId: 10 }],
        skipDuplicates: true,
      });
      // ทุกแถวซ้ำกับที่มีอยู่แล้ว (count: 0) -> ใช้ existingList เดิม ไม่ query ซ้ำ
      expect(prisma.lottoIsBonus.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ results: [{ id: 1 }] });
    });

    it('re-fetches the list once a genuinely new row is inserted (happy path)', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 10, number: '111111' }]);
      prisma.lotto.findMany.mockResolvedValue([{ numbers: '111111' }]);
      prisma.lottoIsBonus.findMany
        .mockResolvedValueOnce([{ id: 1 }]) // existingList (ก่อนตรวจ)
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]); // รายการล่าสุดหลัง insert
      prisma.lottoIsBonus.createMany.mockResolvedValue({ count: 1 });

      const result = await service.lottoIsBonusCheckAndList();

      expect(prisma.lottoIsBonus.findMany).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ results: [{ id: 1 }, { id: 2 }] });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('down'));
      prisma.lotto.findMany.mockResolvedValue([]);
      prisma.lottoIsBonus.findMany.mockResolvedValue([]);

      await expect(service.lottoIsBonusCheckAndList()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('changePrice', () => {
    it('batches every price update into a single transaction (happy path)', async () => {
      prisma.lotto.update.mockResolvedValue({});

      const result = await service.changePrice([
        { id: 1, newPrice: 90 },
        { id: 2, newPrice: 120 },
      ]);

      expect(prisma.lotto.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { sale: 90 },
      });
      expect(prisma.lotto.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { sale: 120 },
      });
      expect(prisma.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([expect.anything(), expect.anything()]),
      );
      expect(result).toEqual({ message: 'success' });
    });

    it('wraps a failure as InternalServerErrorException', async () => {
      prisma.$transaction.mockRejectedValue(new Error('tx failed'));

      await expect(
        service.changePrice([{ id: 1, newPrice: 90 }]),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
