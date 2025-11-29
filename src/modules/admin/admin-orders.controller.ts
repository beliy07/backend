import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateOrderDto } from '../orders/dto/update-order.dto';
import { OrdersService } from '../orders/orders.service';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query() pagination?: PaginationDto) {
    return this.ordersService.findAllAdmin(
      pagination?.limit,
      pagination?.offset,
    );
  }

  @Get('export/excel')
  async exportToExcel(@Res() res: Response) {
    const workbook = await this.ordersService.exportToExcel();
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=orders.xlsx`);

    return res.send(buffer);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.updateStatus(id, updateOrderDto.status);
  }
}
