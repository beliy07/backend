import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.cwd() + '/uploads';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const extension = file.originalname.split('.').pop();
          const filename = `${timestamp}-${randomString}.${extension}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Неподдерживаемый тип файла. Разрешены только: JPEG, PNG, WebP',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    return {
      url: this.uploadService.getFileUrl(file.filename),
      name: file.originalname,
    };
  }

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.cwd() + '/uploads';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const extension = file.originalname.split('.').pop();
          const filename = `${timestamp}-${randomString}.${extension}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Неподдерживаемый тип файла. Разрешены только: JPEG, PNG, WebP',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Файлы не были загружены');
    }

    const uploadedFiles = files.map((file) => ({
      url: this.uploadService.getFileUrl(file.filename),
      name: file.originalname,
    }));

    return {
      files: uploadedFiles,
      count: uploadedFiles.length,
    };
  }
}
