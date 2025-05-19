import { Module } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { MockEmailService } from './mock-email.service';
import { MockWeatherService } from './mock-weather.service';

/**
 * This module overrides real services with mocks for testing
 */
@Module({
  imports: [AppModule],
  providers: [
    MockEmailService,
    MockWeatherService,
    {
      provide: 'EmailService',
      useExisting: MockEmailService,
    },
    {
      provide: 'WeatherService',
      useExisting: MockWeatherService,
    },
  ],
  exports: [MockEmailService, MockWeatherService],
})
export class TestModule {}