import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ChangePriceItemDto,
  ConfirmBuyDto,
  ConfirmPayDto,
  LottoDto,
  SearchLottoDto,
  SendSaveDto,
} from './dto/lotto.dto';

@Injectable()
export class LottoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: LottoDto) {
    try {
      // 🌟 ใส่ { result: ... } ครอบเอาไว้เพื่อให้ React หน้าบ้านอ่านรู้เรื่องครับ
      const res = await this.prisma.lotto.create({ data: dto });
      return { result: res };
    } catch (e) {
      console.error('🔥 Error (lotto create):', e);
      throw new InternalServerErrorException('ไม่สามารถบันทึกสลากได้');
    }
  }

  async list() {
    try {
      return {
        result: await this.prisma.lotto.findMany({
          orderBy: { inSale: 'desc' },
        }),
      };
    } catch (e) {
      console.error('🔥 Error (lotto list):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลสลากได้');
    }
  }

  async listForSale() {
    try {
      const results = await this.prisma.lotto.findMany({
        where: {
          billSaleDetails: { none: { billSale: { payDate: { not: null } } } },
        },
        orderBy: { id: 'desc' },
      });
      return { results };
    } catch (e) {
      console.error('🔥 Error (listForSale):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }

  async remove(id: number) {
    try {
      return { result: await this.prisma.lotto.delete({ where: { id } }) };
    } catch (e) {
      if ((e as { code?: string })?.code === 'P2025') {
        throw new NotFoundException('ไม่พบสลากใบนี้ในระบบ');
      }
      console.error('🔥 Error (lotto remove):', e);
      throw new InternalServerErrorException('ไม่สามารถลบข้อมูลได้');
    }
  }

  async edit(id: number, dto: LottoDto) {
    try {
      return {
        result: await this.prisma.lotto.update({ where: { id }, data: dto }),
      };
    } catch (e) {
      if ((e as { code?: string })?.code === 'P2025') {
        throw new NotFoundException('ไม่พบสลากใบนี้ในระบบ');
      }
      console.error('🔥 Error (lotto edit):', e);
      throw new InternalServerErrorException('ไม่สามารถแก้ไขข้อมูลได้');
    }
  }

  async search(dto: SearchLottoDto) {
    try {
      const condition =
        dto.position === 'start'
          ? { startsWith: dto.numbers }
          : { endsWith: dto.numbers };
      return {
        results: await this.prisma.lotto.findMany({
          where: { numbers: condition },
        }),
      };
    } catch (e) {
      console.error('🔥 Error (lotto search):', e);
      throw new InternalServerErrorException('ไม่สามารถค้นหาสลากได้');
    }
  }

  async confirmBuy(dto: ConfirmBuyDto) {
    try {
      const cartLottoIds = dto.carts.map((cartData) => cartData.item.id);

      // 🌟 ทำทุกอย่างในนี้เป็น transaction เดียว: เช็คว่ามีใบไหนถูกจองไปแล้วระหว่างทาง
      // ก่อนสร้างจริง เพื่อลดโอกาสขายสลากใบเดียวกันซ้ำให้ลูกค้า 2 คนพร้อมกัน (race condition)
      // เช็คนี้ให้ error message ที่อ่านง่ายในเคสปกติ ส่วนกรณีที่สอง request ชนกันพอดี
      // (ผ่านเช็คนี้พร้อมกันทั้งคู่) มี @@unique([lottoId]) ที่ BillSaleDetail เป็น
      // safety net ชั้นสุดท้ายระดับ DB อยู่แล้ว (ดักไว้ใน catch ด้านล่าง)
      return await this.prisma.$transaction(async (tx) => {
        const [lottos, alreadyReserved] = await Promise.all([
          tx.lotto.findMany({ where: { id: { in: cartLottoIds } } }),
          tx.billSaleDetail.findMany({
            where: { lottoId: { in: cartLottoIds } },
            select: { lottoId: true },
          }),
        ]);

        if (alreadyReserved.length > 0) {
          throw new ConflictException(
            'สลากบางใบในตะกร้าเพิ่งถูกลูกค้าคนอื่นซื้อไปก่อนหน้านี้ กรุณาล้างตะกร้าแล้วเลือกใหม่อีกครั้ง',
          );
        }

        const saleById = new Map(
          lottos.map((lotto) => [lotto.id, lotto.sale]),
        );

        const billSale = await tx.billSale.create({
          data: {
            customerName: dto.customerName,
            customerPhone: dto.customerPhone,
            customerAddress: dto.customerAddress,
            createdDate: new Date(),
          },
        });

        await tx.billSaleDetail.createMany({
          data: dto.carts.map((cartData) => ({
            billSaleId: billSale.id,
            lottoId: cartData.item.id,
            price: saleById.get(cartData.item.id) ?? 0,
          })),
        });

        return { message: 'success' };
      });
    } catch (e) {
      if (e instanceof ConflictException) throw e;
      // 🌟 P2002 = unique constraint violation ที่ DB (เคสสอง request ชนกันพอดีในหน้าต่างเวลาสั้นๆ
      // ระหว่างเช็คกับ insert ซึ่งเช็คระดับ Application ด้านบนจับไม่ทัน)
      if ((e as { code?: string })?.code === 'P2002') {
        throw new ConflictException(
          'สลากบางใบในตะกร้าเพิ่งถูกลูกค้าคนอื่นซื้อไปก่อนหน้านี้ กรุณาล้างตะกร้าแล้วเลือกใหม่อีกครั้ง',
        );
      }
      console.error('🔥 Error ConfirmBuy:', e);
      throw new InternalServerErrorException('ไม่สามารถบันทึกคำสั่งซื้อได้');
    }
  }

  async getBillSale() {
    try {
      // 🌟 select เฉพาะฟิลด์ที่หน้า BillSale ใช้จริง แทน include ทั้งก้อน
      const res = await this.prisma.billSale.findMany({
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
      return { result: res };
    } catch (e) {
      console.error('🔥 Error (getBillSale):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลบิลได้');
    }
  }

  async removeBill(id: number) {
    try {
      // 🌟 ใช้ Transaction ลบลูกก่อน แล้วค่อยลบแม่ พร้อมกัน
      await this.prisma.$transaction([
        this.prisma.billSaleDetail.deleteMany({ where: { billSaleId: id } }),
        this.prisma.billSale.delete({ where: { id } }),
      ]);
      return { message: 'success' };
    } catch (e) {
      if ((e as { code?: string })?.code === 'P2025') {
        throw new NotFoundException('ไม่พบบิลนี้ในระบบ');
      }
      console.error('🔥 Error (removeBill):', e);
      throw new InternalServerErrorException('ไม่สามารถลบบิลได้');
    }
  }

  async confirmPay(dto: ConfirmPayDto) {
    try {
      // ใช้ $transaction เพื่อให้มั่นใจว่าบิลกับลอตเตอรี่จะอัปเดตพร้อมกันเสมอ
      return await this.prisma.$transaction(async (tx) => {
        // 1. อัปเดตข้อมูลการชำระเงินใน BillSale
        const updatedBill = await tx.billSale.update({
          where: { id: dto.billSaleId },
          data: {
            payAlertDate: new Date(dto.payAlertDate),
            payDate: new Date(dto.payDate),
            payRemark: dto.payRemark,
            payTime: dto.payTime,
            // สมมติว่ามีสถานะบิล เช่น status: 'paid' ควรใส่ตรงนี้ด้วยครับ
          },
        });

        // 2. ดึงรายการลอตเตอรี่ทั้งหมดในบิลนี้ออกมา
        const billDetails = await tx.billSaleDetail.findMany({
          where: { billSaleId: dto.billSaleId },
        });

        // 3. อัปเดตลอตเตอรี่ "ทุกใบ" ในบิลให้สถานะเป็นขายแล้ว (inSale: true) ด้วย query เดียว แทนการ update ทีละแถวในลูป
        await tx.lotto.updateMany({
          where: { id: { in: billDetails.map((detail) => detail.lottoId) } },
          data: {
            inSale: true,
          },
        });

        return { message: 'success' };
      });
    } catch (e) {
      console.error('🔥 ConfirmPay Error:', e);
      throw new InternalServerErrorException('ไม่สามารถบันทึกการชำระเงินได้');
    }
  }

  async lottoInShop() {
    try {
      const results = await this.prisma.billSale.findMany({
        where: {
          payDate: { not: null },
          OR: [{ customerAddress: '' }, { customerAddress: null }],
        },
        orderBy: { id: 'desc' },
        // 🌟 select เฉพาะฟิลด์ที่หน้า LottoInShop ใช้จริง แทน include ทั้งก้อน
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
      return { results };
    } catch (e) {
      console.error('🔥 Error (lottoInShop):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }

  async lottoForSend() {
    try {
      const results = await this.prisma.billSale.findMany({
        where: { payDate: { not: null }, customerAddress: { not: '' } },
        orderBy: { id: 'desc' },
        // 🌟 select เฉพาะฟิลด์ที่หน้า LottoForSend ใช้จริง แทน include ทั้งก้อน
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
      return { results };
    } catch (e) {
      console.error('🔥 Error (lottoForSend):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }

  async sendSave(dto: SendSaveDto) {
    try {
      const rowCount = await this.prisma.billSaleForSend.findMany({
        where: { billSaleId: dto.billSaleId },
      });
      if (rowCount.length == 0) {
        await this.prisma.billSaleForSend.create({ data: dto as any });
        return { message: 'success' };
      }
      return { message: 'data exist' };
    } catch (e) {
      console.error('🔥 Error (sendSave):', e);
      throw new InternalServerErrorException('ไม่สามารถบันทึกได้');
    }
  }

  async lottoIsBonus() {
    try {
      // 1. หาผลรางวัลล่าสุด
      const bonusRow = await this.prisma.bonusResultDetail.findFirst({
        orderBy: {
          bonusDate: 'desc',
        },
      });

      if (!bonusRow) return { message: 'ยังไม่มีผลรางวัลในระบบ' };
      // 2. ผลรางวัลทั้งหมดในงวดล่าสุด
      const bonusResults = await this.prisma.bonusResultDetail.findMany({
        where: {
          bonusDate: bonusRow.bonusDate,
        },
      });
      // 3. ล็อตเตอรี่ที่ยังอยู่ในแผง (inSale: false)
      const lottos = await this.prisma.lotto.findMany({
        where: {
          inSale: false,
        },
      });

      // 4. ตรวจรางวัล (จับคู่ใน memory แทนการ query ทีละคู่ในลูป เพื่อลดจำนวน query ลงจาก O(N*M) เป็นค่าคงที่)
      const inStockNumbers = new Set(lottos.map((item) => item.numbers));
      const matchedBonusResults = bonusResults.filter((bonusResult) =>
        inStockNumbers.has(bonusResult.number),
      );

      if (matchedBonusResults.length > 0) {
        // 🌟 ให้ DB เป็นคนกันซ้ำผ่าน unique constraint (skipDuplicates) แทนการ findMany เช็คก่อนสร้าง
        // เพราะการเช็คแล้วค่อย insert ที่ฝั่ง Application ไม่ atomic ถ้ามีคนเรียก endpoint นี้ซ้อนกันพอดี
        await this.prisma.lottoIsBonus.createMany({
          data: matchedBonusResults.map((bonusResult) => ({
            bonusResultDetailId: bonusResult.id,
          })),
          skipDuplicates: true,
        });
      }
      return { message: 'success' };
    } catch (e) {
      console.error('🔥 Error (lottoIsBonus):', e);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }
  async lottoIsBonuslist() {
    try {
      const res = await this.prisma.lottoIsBonus.findMany({
        orderBy: {
          id: 'desc',
        },
        // 🌟 select เฉพาะฟิลด์ที่หน้า LottoIsBonus ใช้จริง แทน include ทั้งก้อน
        select: {
          id: true,
          BonusResultDetail: {
            select: { number: true, price: true, bonusDate: true },
          },
        },
      });
      return { results: res };
    } catch (e: any) {
      console.error('🔥 Error (lottoIsBonuslist):', e);
      throw new InternalServerErrorException('ไม่สามารถตรวจสอบสลากได้');
    }
  }

  async changePrice(lottos: ChangePriceItemDto[]) {
    try {
      // 🌟 ส่งคำสั่ง update ทั้งหมดเป็น 1 transaction แทนการ await ทีละแถวแบบ sequential
      // (แต่ละใบราคาไม่เท่ากัน จึงยังต้องเป็นคนละ statement แต่ลด round-trip ระหว่าง statement ลง)
      await this.prisma.$transaction(
        lottos.map((item) =>
          this.prisma.lotto.update({
            where: { id: item.id },
            data: { sale: item.newPrice },
          }),
        ),
      );

      return { message: 'success' };
    } catch (e) {
      if ((e as { code?: string })?.code === 'P2025') {
        throw new NotFoundException(
          'ไม่พบสลากบางรายการที่ต้องการปรับราคา (อาจถูกลบไปแล้ว)',
        );
      }
      console.error('🔥 Error (changePrice):', e);
      throw new InternalServerErrorException('ไม่สามารถปรับราคาได้');
    }
  }
}
