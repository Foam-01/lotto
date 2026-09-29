import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

// รายริฟฟี (lotto.api.rayriffy.com) ปิดให้บริการแล้ว (repo archived) จึงย้ายมาใช้ API
// ทางการของสำนักงานสลากกินแบ่งรัฐบาลแทน โครงสร้างข้อมูลเป็นคนละแบบ ห้ามนำ mapping เดิมมาใช้ซ้ำ
const GLO_LATEST_LOTTERY_URL =
  'https://www.glo.or.th/api/lottery/getLatestLottery';

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

// แปลง "2026-09-16" (ค.ศ. จาก GLO) -> "16 กันยายน 2569" (พ.ศ. แบบเดียวกับข้อมูลเดิมในระบบ)
// คำนวณจากตัวเลขตรงๆ แทนการใช้ Date object เพื่อเลี่ยงปัญหา timezone เลื่อนวัน
function toThaiBuddhistDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} ${THAI_MONTHS[month - 1]} ${year + 543}`;
}

type GloPrizeGroup = { price: string; number: { round: number; value: string }[] };

@Injectable()
export class BonusService {
  constructor(private readonly prisma: PrismaService) {}

  async getBonus() {
    try {
      const res = await axios.post(
        GLO_LATEST_LOTTERY_URL,
        {},
        { headers: { 'Content-Type': 'application/json' } },
      );

      const payload = res.data?.response;
      const data = payload?.data;
      if (!payload?.date || !data) {
        throw new Error('รูปแบบข้อมูลจาก GLO ไม่ตรงตามที่คาดไว้');
      }

      const bonusDate = toThaiBuddhistDate(payload.date);

      const row = await this.prisma.bonusResultDetail.findMany({
        where: { bonusDate: bonusDate },
      });

      if (row.length > 0) {
        return {
          status: 'success',
          date: bonusDate,
          message: 'ข้อมูลของงวดนี้ถูกอัปเดตในระบบเรียบร้อยแล้ว (ไม่บันทึกซ้ำ)',
        };
      }

      const insertData: { number: string; price: number; bonusDate: string }[] =
        [];

      const pushGroup = (group?: GloPrizeGroup) => {
        if (!group) return;
        const reward = Number(group.price);
        group.number.forEach((n) => {
          insertData.push({ number: n.value, price: reward, bonusDate });
        });
      };

      pushGroup(data.first);
      pushGroup(data.second);
      pushGroup(data.third);
      pushGroup(data.fourth);
      pushGroup(data.fifth);
      pushGroup(data.near1);
      pushGroup(data.last2);
      pushGroup(data.last3f);
      pushGroup(data.last3b);

      await this.prisma.bonusResultDetail.createMany({ data: insertData });

      return {
        status: 'success',
        date: bonusDate,
        message: `บันทึกข้อมูลสลากและเงินรางวัลจำนวน ${insertData.length} รายการเรียบร้อยแล้ว`,
        lotto_result: {
          prize1: data.first.number[0]?.value,
          prize1Near: data.near1.number.map((n) => n.value),
          prize2: data.second.number.map((n) => n.value),
          prize3: data.third.number.map((n) => n.value),
          prize4: data.fourth.number.map((n) => n.value),
          prize5: data.fifth.number.map((n) => n.value),
          front3: data.last3f.number.map((n) => n.value),
          back3: data.last3b.number.map((n) => n.value),
          back2: data.last2.number[0]?.value,
        },
      };
    } catch (e: any) {
      const errorDetail = e.response?.data || e.message;
      console.error('🔥 API Error (getBonus):', errorDetail);
      throw new InternalServerErrorException(
        'ไม่สามารถดึงข้อมูลและบันทึกสลากได้ (API ต้นทางอาจมีปัญหา)',
      );
    }
  }

  async list() {
    try {
      const res = await this.prisma.bonusResultDetail.groupBy({
        by: ['bonusDate'],
        // 🌟 1. ดึงค่า ID ที่มากที่สุดของแต่ละกลุ่มงวดออกมา
        _max: {
          id: true,
        },
        // 🌟 2. สั่งเรียงลำดับกลุ่ม โดยยึดจาก ID ล่าสุด (desc) แทนการเรียงตามชื่อตัวอักษร
        orderBy: {
          _max: {
            id: 'desc',
          },
        },
      });

      // 🌟 3. (Optional) คลีนข้อมูลก่อนส่งกลับไปให้หน้าบ้าน จะได้ไม่ต้องแก้โค้ด React
      const cleanResults = res.map((item) => ({
        bonusDate: item.bonusDate,
      }));

      return { results: cleanResults };
    } catch (e: any) {
      console.error('🔥 Error (list bonus):', e.message);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }

  async listDetail(bonusDate: string) {
    try {
      const res = await this.prisma.bonusResultDetail.findMany({
        where: { bonusDate: bonusDate },
        orderBy: { price: 'desc' },
      });
      return { results: res };
    } catch (e: any) {
      console.error('🔥 Error (listDetail bonus):', e.message);
      throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลได้');
    }
  }

  async checkBonus() {
    try {
      // billSaleDetails กับ lastResult ไม่ขึ้นต่อกัน ยิงพร้อมกันได้ ลด round-trip ไป DB หนึ่งรอบ
      // (bonusResultDetails ต้องรอ bonusDate จาก lastResult ก่อน จึงยัง sequential อยู่)
      const [billSaleDetails, lastResult] = await Promise.all([
        this.prisma.billSaleDetail.findMany({
          where: {
            billSale: { payDate: { not: null } },
            lotto: { isCheckBonus: false },
          },
          // select เฉพาะฟิลด์ที่ใช้จริงในการจับคู่ผลรางวัลด้านล่าง แทน include ทั้งก้อน
          select: {
            id: true,
            lotto: { select: { id: true, numbers: true } },
          },
        }),
        this.prisma.bonusResultDetail.findFirst({
          orderBy: { bonusDate: 'desc' },
        }),
      ]);

      const bonusResultDetails = await this.prisma.bonusResultDetail.findMany({
        where: { bonusDate: lastResult?.bonusDate },
      });

      // 🌟 จับคู่ผลรางวัลใน memory ก่อน แล้วค่อย create/update เป็น batch เดียว
      // แทนการ await create()/update() อยู่ข้างในลูปซ้อนลูป (เดิมคือ O(N*M) query ไปที่ DB)
      const winningPairs: {
        billSaleDetailId: number;
        bonusResultDetailId: number;
      }[] = [];

      for (const item of billSaleDetails) {
        for (const item2 of bonusResultDetails) {
          let isWin = false;

          if (
            item2.number.length === 2 &&
            item.lotto.numbers.endsWith(item2.number)
          ) {
            isWin = true;
          } else if (
            item2.number.length === 3 &&
            (item.lotto.numbers.startsWith(item2.number) ||
              item.lotto.numbers.endsWith(item2.number))
          ) {
            isWin = true;
          } else if (item.lotto.numbers === item2.number) {
            isWin = true;
          }

          if (isWin) {
            winningPairs.push({
              billSaleDetailId: item.id,
              bonusResultDetailId: item2.id,
            });
          }
        }
      }

      if (winningPairs.length > 0) {
        // 🌟 skipDuplicates กันแถวซ้ำถ้า endpoint นี้ถูกเรียกซ้อนกัน (unique constraint บน billSaleDetailId+bonusResultDetailId)
        await this.prisma.billSaleDetailIsBonus.createMany({
          data: winningPairs,
          skipDuplicates: true,
        });
      }

      const checkedLottoIds = [
        ...new Set(billSaleDetails.map((item) => item.lotto.id)),
      ];
      if (checkedLottoIds.length > 0) {
        await this.prisma.lotto.updateMany({
          data: { isCheckBonus: true },
          where: { id: { in: checkedLottoIds } },
        });
      }

      // select เฉพาะฟิลด์ที่หน้า SaleBonus ใช้จริง แทน include ทั้งก้อน
      const resultBonus = await this.prisma.billSaleDetailIsBonus.findMany({
        select: {
          id: true,
          BillSaleDetail: {
            select: {
              billSaleId: true,
              billSale: {
                select: {
                  customerName: true,
                  customerPhone: true,
                  transferMoneyDate: true,
                  transferMoneyTime: true,
                  deliverDate: true,
                },
              },
            },
          },
          BonusResultDetail: {
            select: { number: true, price: true, bonusDate: true },
          },
        },
      });

      return { message: 'success', results: resultBonus };
    } catch (e: any) {
      console.error('🔥 Error (checkBonus):', e);
      throw new InternalServerErrorException('ไม่สามารถตรวจและบันทึกสลากได้');
    }
  }
}
