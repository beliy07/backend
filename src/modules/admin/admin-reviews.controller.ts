import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from '../products/reviews.service';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(@Query() pagination?: PaginationDto) {
    return this.reviewsService.findAll(pagination?.limit, pagination?.offset);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }
}
