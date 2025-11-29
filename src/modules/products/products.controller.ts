import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductsService } from './products.service';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.productsService.findAll(
      categoryId,
      pagination?.limit,
      pagination?.offset,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/reviews')
  getReviews(@Param('id') id: string) {
    return this.reviewsService.findByProduct(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  createReview(
    @Req() req: any,
    @Param('id') id: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(req.user.id, id, createReviewDto);
  }
}
