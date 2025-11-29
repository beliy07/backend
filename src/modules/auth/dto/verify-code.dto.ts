import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
