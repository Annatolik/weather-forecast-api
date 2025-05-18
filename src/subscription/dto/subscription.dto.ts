import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({
    description: 'Email address to subscribe',
    example: 'user@example.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'City for weather updates',
    example: 'Lviv',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Frequency of updates (hourly or daily)',
    example: 'daily',
    enum: ['hourly', 'daily'],
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(['hourly', 'daily'], { message: 'Frequency must be either hourly or daily' })
  frequency: string;
}

export class TokenDto {
  @ApiProperty({
    description: 'Confirmation or unsubscribe token',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}