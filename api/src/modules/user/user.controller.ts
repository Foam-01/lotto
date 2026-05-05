import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  async list() {
    return this.userService.list();
  }

  @Post('create')
  async create(@Body() dto: UserDto) {
    return this.userService.create(dto);
  }

  @Put('edit/:id')
  async edit(@Param('id', ParseIntPipe) id: number, @Body() dto: UserDto) {
    return this.userService.edit(id, dto);
  }

  @Delete('remove/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
