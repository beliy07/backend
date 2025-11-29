import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import * as ExcelJS from 'exceljs';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { OrderStatus } from 'src/generated/prisma/enums';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    let unitPrice: Decimal;
    if (product.variants.length) {
      if (!dto.variants?.length) {
        throw new BadRequestException(
          'Для этого товара необходимо выбрать варианты',
        );
      }

      const variantPrices: Decimal[] = [];
      for (const orderVariant of dto.variants) {
        const productVariant = product.variants.find(
          (pv) =>
            pv.value === orderVariant.value && pv.label === orderVariant.label,
        );

        if (!productVariant) {
          throw new BadRequestException(
            `Вариант "${orderVariant.label}: ${orderVariant.value}" не найден для этого товара`,
          );
        }

        variantPrices.push(productVariant.price);
      }

      unitPrice = variantPrices.reduce((max, price) => {
        return price.gt(max) ? price : max;
      }, variantPrices[0]);
    } else {
      unitPrice = product.price;
    }

    const total = unitPrice.mul(dto.amount || 1);

    return this.prisma.order.create({
      data: {
        userId,
        productId: dto.productId,
        image: dto.image,
        amount: dto.amount || 1,
        total,
        variants: dto.variants?.map((v) => ({
          label: v.label,
          value: v.value,
        })),
      },
    });
  }

  async findAll(userId: string, limit?: number, offset?: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true,
            images: true,
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

  async findAllAdmin(limit?: number, offset?: number) {
    return this.prisma.order.findMany({
      include: {
        product: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            email: true,
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

  async updateStatus(id: number, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: {
        status,
      },
    });
  }

  async exportToExcel() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.COMPLETED,
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Заказы');

    worksheet.columns = [
      { header: 'Номер заказа', key: 'id', width: 36 },
      { header: 'Email пользователя', key: 'userEmail', width: 30 },
      { header: 'Наименование товара', key: 'productName', width: 30 },
      { header: 'Параметры', key: 'variants', width: 40 },
      { header: 'Сумма', key: 'total', width: 15 },
      { header: 'Дата создания', key: 'createdAt', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    orders.forEach((order) => {
      const orderVariants = order.variants as Array<{
        label: string;
        value: string;
      }> | null;
      const variantsText = orderVariants?.length
        ? orderVariants.map((v) => `${v.label}: ${v.value}`).join(', ')
        : '-';

      worksheet.addRow({
        id: order.id,
        userEmail: order.user.email,
        productName: order.product.name,
        variants: variantsText,
        total: order.total.toNumber(),
        createdAt: order.createdAt.toLocaleString('ru-RU'),
      });
    });

    return workbook;
  }
}
