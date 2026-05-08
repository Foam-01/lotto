import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // auth.module.ts
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
