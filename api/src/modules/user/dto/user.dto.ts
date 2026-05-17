import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  user!: string;

  @IsOptional()
  @IsString()
  pwd?: string;

  @IsString()
  @IsNotEmpty()
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
