import { IsIn, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  user!: string;

  @IsOptional()
  @IsString()
  pwd?: string;

  // 🌟 จำกัดค่าที่ตั้งได้ไว้แค่ 2 ระดับที่ระบบรองรับจริง กัน client ส่งค่า level มั่วๆ เข้ามา
  @IsString()
  @IsIn(['admin', 'user'])
  level!: string;

  // 🌟 เพิ่ม 4 ฟิลด์นี้เข้าไปใน DTO เพื่ออนุญาตให้ข้อมูลวิ่งผ่านไปฐานข้อมูลได้ครับ!
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
