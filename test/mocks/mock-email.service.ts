import { Injectable } from '@nestjs/common';

@Injectable()
export class MockEmailService {
  private readonly sentEmails: Array<{
    to: string;
    subject: string;
    html: string;
  }> = [];

  async sendConfirmationEmail(email: string, city: string, token: string): Promise<void> {
    this.sentEmails.push({
      to: email,
      subject: `Confirm your weather subscription for ${city}`,
      html: `Confirmation token: ${token}`,
    });

    return Promise.resolve();
  }

  async sendWeatherUpdate(
    email: string, 
    city: string, 
    weatherData: any, 
    unsubscribeToken: string
  ): Promise<void> {
    this.sentEmails.push({
      to: email,
      subject: `Weather Update for ${city}`,
      html: `Weather data: ${JSON.stringify(weatherData)}, Unsubscribe token: ${unsubscribeToken}`,
    });

    return Promise.resolve();
  }

  getLastEmail() {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  getAllEmails() {
    return [...this.sentEmails];
  }

  clearEmails() {
    this.sentEmails.length = 0;
  }
}