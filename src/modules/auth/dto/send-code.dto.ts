import { IsEmail } from 'class-validator';

export class SendCodeDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;
}
