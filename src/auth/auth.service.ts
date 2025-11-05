import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../user/schemas/refresh-token.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Xóa hết refresh token cũ của user này trước khi tạo mới
    await this.refreshTokenModel.deleteMany({ userId: user._id });
    return this.generateTokens(user);
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Configuration ${key} is required but not found`);
    }
    return value;
  }

  async generateTokens(user: any) {
    const accessTokenPayload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const refreshTokenPayload = {
      sub: user._id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      // Tạo access token
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.getRequiredConfig('JWT_ACCESS_SECRET'),
        expiresIn: this.getRequiredConfig(
          'JWT_ACCESS_EXPIRY',
        ) as unknown as any,
      }),
      // Tạo refresh token
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.getRequiredConfig('JWT_REFRESH_SECRET'),
        expiresIn: this.getRequiredConfig(
          'JWT_REFRESH_EXPIRY',
        ) as unknown as any,
      }),
    ]);

    const refreshTokenExpires = new Date();
    const expiryDays = parseInt(
      this.getRequiredConfig('JWT_REFRESH_EXPIRY').slice(0, -1),
    );
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + expiryDays);

    // Lưu refresh token (dạng JWT) vào DB
    const newRefreshToken = new this.refreshTokenModel({
      userId: user._id,
      refreshToken: refreshToken, // Lưu chuỗi JWT
      expiresAt: refreshTokenExpires,
    });
    await newRefreshToken.save();

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires: refreshTokenExpires,
    };
  }

  async refreshAccessToken(token: string) {
    try {
      // 1. Xác minh chữ ký và payload của refresh token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.getRequiredConfig('JWT_REFRESH_SECRET'),
      });

      // 2. Kiểm tra xem token có trong DB không (chưa bị thu hồi)
      const tokenExists = await this.refreshTokenModel
        .findOne({ refreshToken: token })
        .populate('userId');

      if (!tokenExists) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      // Lấy thông tin user từ token đã populate
      const user = tokenExists.userId as any;

      // 3. Tạo access token mới
      const accessTokenPayload = {
        sub: user._id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = await this.jwtService.signAsync(
        accessTokenPayload,
        {
          secret: this.getRequiredConfig('JWT_ACCESS_SECRET'),
          expiresIn: this.getRequiredConfig(
            'JWT_ACCESS_EXPIRY',
          ) as unknown as any,
        },
      );

      return {
        access_token: newAccessToken,
      };
    } catch (e) {
      // Bắt lỗi nếu verifyAsync thất bại (token sai, hết hạn...)
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async revokeRefreshToken(refreshToken: string) {
    return this.refreshTokenModel.deleteOne({ refreshToken });
  }
}
