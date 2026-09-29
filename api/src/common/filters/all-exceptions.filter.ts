import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * ตาข่ายนิรภัยสุดท้าย: ดักทุก error ที่ service/controller ไม่ได้ catch เอง
 * เพื่อให้ response ที่ส่งกลับ client มีรูปแบบเดียวกันเสมอ และไม่มีวันหลุด
 * stack trace / ข้อความ error ดิบจากไลบรารี (เช่น Prisma) ออกไปให้ client เห็น
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // ถ้าเป็น HttpException ที่ service ตั้งใจ throw เอง (เช่น NotFoundException)
    // ให้ใช้ข้อความเดิม ไม่ต้องแปลง เพราะเป็นข้อความที่คัดกรองไว้แล้วว่าไม่มีข้อมูลลับ
    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : null;
    const message =
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
        ? (exceptionResponse as { message: unknown }).message
        : isHttpException
          ? exception.message
          : 'เกิดข้อผิดพลาดบางอย่างในระบบ กรุณาลองใหม่อีกครั้ง';

    // log รายละเอียดจริงไว้ฝั่ง server เท่านั้น (ไม่ส่งออกไปให้ client)
    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error(
      `${request.method} ${request.url} -> ${status}: ${
        exception instanceof Error ? exception.message : String(exception)
      }`,
      stack,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error: isHttpException ? exception.name : 'Internal Server Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
