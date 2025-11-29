import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { UserService } from '../user/user.service';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { EmailService } from './services/email.service';

@Injectable()
export class AuthService {
  private adminEmails: string[];

  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private emailService: EmailService,
    private configService: ConfigService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {
    const adminEmailsConfig = this.configService.get<string>('ADMIN_USER_EMAILS');
    this.adminEmails = adminEmailsConfig
      ? adminEmailsConfig.split(',').map((email) => email.toLowerCase().trim())
      : [];
  }

  public issueToken(userId: string, isAdmin: boolean = false) {
    const data = { id: userId, isAdmin };

    const accessToken = this.jwt.sign(data);

    return { accessToken };
  }

  async sendCode(dto: SendCodeDto) {
    const email = dto.email.toLowerCase().trim();

    const verificationCode = this.generateVerificationCode();

    await this.redis.del(`email:code:${email}`);
    await this.redis.setex(`email:code:${email}`, 600, verificationCode);

    const sent = await this.emailService.sendVerificationEmail(
      email,
      verificationCode,
    );

    if (!sent) {
      throw new BadRequestException('Не удалось отправить email');
    }

    return {
      message: 'Код подтверждения отправлен на указанный email',
    };
  }

  async verifyCode(dto: VerifyCodeDto) {
    const { code, email } = dto;
    const normalizedEmail = email.toLowerCase().trim();

    const codeKey = `email:code:${normalizedEmail}`;
    const savedCode = await this.redis.get(codeKey);

    if (!savedCode) {
      throw new UnauthorizedException('Код не найден или истек');
    }

    if (savedCode !== code) {
      throw new UnauthorizedException('Неверный код подтверждения');
    }

    await this.redis.del(codeKey);

    let user = await this.userService.getByEmail(normalizedEmail);
    if (!user) {
      user = await this.userService.create(normalizedEmail);
    }

    const isAdmin = this.adminEmails.includes(user.email.toLowerCase());
    const token = this.issueToken(user.id, isAdmin);

    return { ...token, isAdmin };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
