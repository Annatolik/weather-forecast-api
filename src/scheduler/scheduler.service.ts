import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from '../subscription/subscription.service';
import { WeatherService } from '../weather/weather.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private subscriptionService: SubscriptionService,
    private weatherService: WeatherService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyUpdates() {
    this.logger.log('Processing hourly weather updates...');
    await this.processWeatherUpdates('hourly');
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyUpdates() {
    this.logger.log('Processing daily weather updates...');
    await this.processWeatherUpdates('daily');
  }

  private async processWeatherUpdates(frequency: string) {
    try {
      const subscriptions = await this.subscriptionService.findAllConfirmedByFrequency(frequency);
      
      this.logger.log(`Found ${subscriptions.length} ${frequency} subscriptions to process`);
      
      for (const subscription of subscriptions) {
        try {
          // Get weather data for the city
          const weatherData = await this.weatherService.getWeather(subscription.city);
          
          // Send email with weather update
          await this.emailService.sendWeatherUpdate(
            subscription.email,
            subscription.city,
            weatherData,
            subscription.unsubscribeToken,
          );
          
          this.logger.log(`Sent ${frequency} update to ${subscription.email} for ${subscription.city}`);
        } catch (error) {
          this.logger.error(`Failed to process subscription: ${error.message}`, error.stack);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to process ${frequency} updates: ${error.message}`, error.stack);
    }
  }
}