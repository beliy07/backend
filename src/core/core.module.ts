import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '../modules/admin/admin.module';
import { AuthModule } from '../modules/auth/auth.module';
import { OrdersModule } from '../modules/orders/orders.module';
import { ProductsModule } from '../modules/products/products.module';
import { UploadModule } from '../modules/upload/upload.module';
import { UserModule } from '../modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    RedisModule,

    UserModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    UploadModule,
  ],
})
export class CoreModule {}
