import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  getFileUrl(filename: string): string {
    const baseUrl = this.configService.get<string>('APP_URL');
    return `${baseUrl}/uploads/${filename}`;
  }
}
