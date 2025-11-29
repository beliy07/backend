import { IsEnum } from 'class-validator';
import { OrderStatus } from 'src/generated/prisma/client';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
