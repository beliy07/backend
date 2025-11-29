import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Query() pagination?: PaginationDto) {
    return this.userService.findAll(pagination?.limit, pagination?.offset);
  }
}
