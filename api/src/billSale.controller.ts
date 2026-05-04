import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UnauthorizedException,
  Headers,
  Query,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type {
  BillSaleDetail,
  BillSaleForSend,
  Lotto,
  BillSale,
} from '@prisma/client';

const prisma = new PrismaClient();

@Controller('/api/billSale')
export class BillSaleController {
  @Post('/TranferMoney')
  async TranferMoney(
    @Body('billSaleId') billSaleId: number,
    @Body('tranferMoneyDate') tranferMoneyDate: string,
    @Body('tranferMoneyTime') tranferMoneyTime: string,
    @Body('price') price: number,
  ) {
    try {
      const res = await prisma.billSale.update({
        data: {
          tranferMoneyTime: tranferMoneyTime,
          tranferMoneyDate: tranferMoneyDate,
          price: price,
        },
        where: {
          id: billSaleId,
        },
      });
      if (res.id !== undefined) {
        return {
          message: 'success',
        };
      } else {
        return {
          message: 'update error',
        };
      }
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถบันทึกสลากได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Post('/deliverMoney')
  async deliverMoney(
    @Body('deliverDate') deliverDate: string,
    @Body('price') price: number,
    @Body('billSaleId') billSaleId: number
  ) {
    try {
      const res = await prisma.billSale.update({
        data: {
          
          deliverDate: deliverDate,
          price: price,
        },
        where: {
          id: billSaleId,
        },
      });
      if (res.id !== undefined) {
        return {
          message: 'success',
        };
      } else {
        return {
          message: 'update error',
        };
      }
    } catch (e) {
      return {
        status: 500,
        message: 'ไม่สามารถบันทึกสลากได้',
        error: 'ข้อมูลอาจไม่ถูกต้อง',
      };
    }
  }

  @Post('/income')
  async income(
    @Body('fromDate') fromDate: string,
    @Body('toDate') toDate: string,
  ) {
    try {
        const res = await prisma.billSaleDetail.findMany({
            where: {
                billSale: {
                    payDate: {
                        not: null,
                        gte: new Date(fromDate).toISOString(),
                        lte: new Date(toDate).toISOString(),
                    }
                }
            }
        })
        return { results: res }
    } catch (e) {
        return {
            status: 500,
            message: 'ไม่สามารถบันทึกสลากได้',
            error: 'ข้อมูลอาจไม่ถูกต้อง',
        }
    }
  }
}
