import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { WeatherResponseDto } from '../weather/dto/weather.dto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('email.host'),
        port: this.configService.get<number>('email.port'),
        secure: this.configService.get<number>('email.port') === 465, // true for 465, false for other ports
        auth: {
          user: this.configService.get<string>('email.user'),
          pass: this.configService.get<string>('email.pass'),
        },
      });

      // Verify connection configuration
      this.transporter.verify((error) => {
        if (error) {
          this.logger.error(`SMTP connection error: ${error.message}`, error.stack);
        } else {
          this.logger.log('SMTP server connection established successfully');
        }
      });
    } catch (error) {
      this.logger.error(`Failed to initialize email transporter: ${error.message}`, error.stack);
    }
  }

  async sendConfirmationEmail(email: string, city: string, token: string): Promise<void> {
    const baseUrl = this.configService.get<string>('app.baseUrl');
    const confirmUrl = `${baseUrl}/api/confirm/${token}`;
    
    try {
      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('email.from'),
        to: email,
        subject: `Confirm your weather subscription for ${city}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0066cc;">Weather Subscription Confirmation</h2>
            <p>Thank you for subscribing to weather updates for <strong>${city}</strong>.</p>
            <p>Please click the link below to confirm your subscription:</p>
            <p>
              <a href="${confirmUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                Confirm Subscription
              </a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              If you did not request this subscription, you can ignore this email.
            </p>
            <p style="font-size: 12px; color: #666;">
              If the button above doesn't work, copy and paste this URL into your browser: ${confirmUrl}
            </p>
          </div>
        `,
      });
      
      this.logger.log(`Confirmation email sent to ${email} for city ${city}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send confirmation email to ${email}: ${error.message}`, error.stack);
      throw new Error(`Failed to send confirmation email: ${error.message}`);
    }
  }

  async sendWeatherUpdate(
    email: string, 
    city: string, 
    weatherData: WeatherResponseDto, 
    unsubscribeToken: string
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('app.baseUrl');
    const unsubscribeUrl = `${baseUrl}/api/unsubscribe/${unsubscribeToken}`;
    
    try {
      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('email.from'),
        to: email,
        subject: `Weather Update for ${city}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0066cc;">Weather Update for ${city}</h2>
            <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Temperature:</strong> ${weatherData.temperature}°C</p>
              <p><strong>Humidity:</strong> ${weatherData.humidity}%</p>
              <p><strong>Conditions:</strong> ${weatherData.description}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
              You are receiving this email because you subscribed to weather updates for ${city}.
              <br>
              <a href="${unsubscribeUrl}" style="color: #0066cc;">Unsubscribe from weather updates</a>
            </p>
          </div>
        `,
      });
      
      this.logger.log(`Weather update email sent to ${email} for city ${city}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send weather update to ${email}: ${error.message}`, error.stack);
      throw new Error(`Failed to send weather update: ${error.message}`);
    }
  }
}