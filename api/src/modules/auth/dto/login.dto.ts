import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString() @IsNotEmpty() usr!: string;
  @IsString() @IsNotEmpty() pwd!: string;
}
