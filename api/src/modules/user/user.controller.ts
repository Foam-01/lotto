import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// 🔒 การจัดการบัญชีผู้ใช้/พนักงานทั้งหมด ต้องล็อกอินเท่านั้น
// (เดิมไม่มี Guard เลยสักตัว ใครก็เรียกสร้าง/ลบ/เปลี่ยนรหัสผ่านผู้ใช้ได้)
@UseGuards(JwtAuthGuard)
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

  @Put('change-password/:id')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.userService.changePassword(
      id,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
