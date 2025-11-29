import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  private adminEmails: string[];

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const adminEmailsConfig = this.configService.get<string>('ADMIN_USER_EMAILS');
    this.adminEmails = adminEmailsConfig
      ? adminEmailsConfig.split(',').map((email) => email.toLowerCase().trim())
      : [];
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userPayload = request.user;

    const user = await this.prisma.user.findUnique({
      where: { id: userPayload.id },
      select: { email: true },
    });

    if (!user || !this.adminEmails.includes(user.email.toLowerCase())) {
      throw new ForbiddenException('Доступ запрещен. Требуются права администратора');
    }

    return true;
  }
}

