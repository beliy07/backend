import { Module } from '@nestjs/common';
import { AdminProductsController } from './admin-products.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminReviewsController } from './admin-reviews.controller';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ProductsModule,
    OrdersModule,
    UserModule,
  ],
  controllers: [
    AdminProductsController,
    AdminOrdersController,
    AdminUsersController,
    AdminReviewsController,
  ],
})
export class AdminModule {}

