import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email: string;

  @IsString({ message: 'Password is required.' })
  @MinLength(1, { message: 'Password cannot be empty.' })
  password: string;
}
