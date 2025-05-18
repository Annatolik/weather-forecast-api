import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { WeatherModule } from '../weather/weather.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [SubscriptionModule, WeatherModule, EmailModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}