import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Req() req: any,
    @Query() pagination?: PaginationDto,
  ) {
    return this.ordersService.findAll(
      req.user.id,
      pagination?.limit,
      pagination?.offset,
    );
  }
}
