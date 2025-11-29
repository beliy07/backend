import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}

  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Код подтверждения',
        template: 'verification',
        context: {
          code,
        },
      });
      this.logger.log(`Код подтверждения отправлен на ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Ошибка отправки email: ${error.message}`, error.stack);
      return false;
    }
  }
}
