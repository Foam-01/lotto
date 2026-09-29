import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_SECRET } from './jwt-secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET, // ต้องตรงกับค่าที่ auth.module.ts ใช้เซ็น token
    });
  }

  async validate(payload: any) {
    // ถ้ายามตรวจ Token ผ่าน จะคืนค่าข้อมูลพนักงานคนนั้นให้ระบบรู้จัก
    return {
      userId: payload.sub,
      username: payload.user,
      level: payload.level,
      // รหัสผผ่านไม่ต้องส่ง
    };
  }
}
