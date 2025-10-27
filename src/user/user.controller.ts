import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.register(createUserDto);

    const { password, ...result } = user.toObject();
    return result;
  }
}
