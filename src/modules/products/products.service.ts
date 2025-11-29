import { Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Категория не найдена');
      }
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: new Decimal(dto.price),
        images: dto.images,
        productionDays: dto.productionDays,
        categoryId: dto.categoryId ? dto.categoryId : undefined,
        variants: dto.variants
          ? {
              create: dto.variants.flatMap((variant) =>
                variant.options.map((option) => ({
                  value: option.value,
                  label: variant.label,
                  price: new Decimal(option.price),
                })),
              ),
            }
          : undefined,
      },
    });
  }

  async findAll(categoryId?: string, limit?: number, offset?: number) {
    return this.prisma.product.findMany({
      where: {
        categoryId,
      },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  async delete(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
