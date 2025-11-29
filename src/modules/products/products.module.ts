import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ReviewsService],
  exports: [ProductsService, ReviewsService],
})
export class ProductsModule {}
