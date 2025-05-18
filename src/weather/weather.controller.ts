import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherQueryDto, WeatherResponseDto } from './dto/weather.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Get current weather for a city' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current weather forecast returned successfully',
    type: WeatherResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'City not found' })
  async getWeather(@Query() query: WeatherQueryDto): Promise<WeatherResponseDto> {
    return this.weatherService.getWeather(query.city);
  }
}