import { IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsString() @IsNotEmpty() user!: string;
  @IsString() @IsNotEmpty() pwd!: string;
  @IsString() @IsNotEmpty() level!: string;
}
