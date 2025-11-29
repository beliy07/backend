import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ProductsService } from '../products/products.service';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
