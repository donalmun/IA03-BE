import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { access_token, refresh_token, expires } =
      await this.authService.login(user);

    const isProduction = this.configService.get('NODE_ENV') === 'production';

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: isProduction, // Chỉ true khi ở môi trường production
      sameSite: 'strict',
      path: '/',
      expires: expires, // Sử dụng ngày hết hạn từ service
    });

    return { access_token };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() request: Request) {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in cookies');
    }
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // Đảm bảo các tùy chọn khi xóa cookie phải giống hệt khi set
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}
