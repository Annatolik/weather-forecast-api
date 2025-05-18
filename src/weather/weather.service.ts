import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WeatherResponseDto } from './dto/weather.dto';

@Injectable()
export class WeatherService {
  constructor(private configService: ConfigService) {}

  async getWeather(city: string): Promise<WeatherResponseDto> {
    try {
      const apiKey = this.configService.get<string>('weather.apiKey');
      const apiUrl = this.configService.get<string>('weather.apiUrl');
      
      const response = await axios.get(`${apiUrl}/current.json`, {
        params: {
          key: apiKey,
          q: city,
        },
      });

      // Extract required fields from the WeatherAPI.com response
      return {
        temperature: response.data.current.temp_c,
        humidity: response.data.current.humidity,
        description: response.data.current.condition.text,
      };
    } catch (error) {
      if (error.response && error.response.status === 400) {
        throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
      } else if (error.response && error.response.status === 404) {
        throw new HttpException('City not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to fetch weather data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}