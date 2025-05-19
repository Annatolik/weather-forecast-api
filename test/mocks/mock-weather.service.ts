import { Injectable } from '@nestjs/common';
import { WeatherResponseDto } from '../../src/weather/dto/weather.dto';

@Injectable()
export class MockWeatherService {
  private readonly mockWeatherData: Record<string, WeatherResponseDto> = {
    'Lviv': {
      temperature: 15.5,
      humidity: 75,
      description: 'Partly cloudy',
    },
    'Kyiv': {
      temperature: 18.2,
      humidity: 65,
      description: 'Sunny',
    },
    'Odesa': {
      temperature: 22.8,
      humidity: 80,
      description: 'Mostly sunny',
    },
    'default': {
      temperature: 20.0,
      humidity: 70,
      description: 'Clear',
    },
  };

  async getWeather(city: string): Promise<WeatherResponseDto> {
    // If the city is not in our mock data, return default or throw an error based on the city name
    if (city.toLowerCase() === 'error') {
      throw new Error('City not found');
    }
    
    return this.mockWeatherData[city] || this.mockWeatherData['default'];
  }
}