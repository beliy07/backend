import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, productId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    const completedOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        productId,
        status: 'COMPLETED',
      },
    });

    if (!completedOrder) {
      throw new BadRequestException(
        'Вы можете оставить отзыв только на товар из завершенного заказа',
      );
    }

    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('Вы уже оставили отзыв на этот товар');
    }

    return this.prisma.review.create({
      data: {
        userId,
        productId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async findByProduct(productId: string, limit?: number, offset?: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  async findAll(limit?: number, offset?: number) {
    return this.prisma.review.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  async delete(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }
}
