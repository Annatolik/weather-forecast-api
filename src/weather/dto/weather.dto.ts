import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WeatherQueryDto {
  @ApiProperty({
    description: 'City name for weather forecast',
    example: 'Lviv',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  city: string;
}

export class WeatherResponseDto {
  @ApiProperty({
    description: 'Current temperature in Celsius',
    example: 21.5,
  })
  temperature: number;

  @ApiProperty({
    description: 'Current humidity percentage',
    example: 65,
  })
  humidity: number;

  @ApiProperty({
    description: 'Weather description',
    example: 'Partly cloudy',
  })
  description: string;
}