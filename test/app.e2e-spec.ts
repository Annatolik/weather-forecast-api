import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { MockEmailService } from './mocks/mock-email.service';
import { MockWeatherService } from './mocks/mock-weather.service';
import { SubscriptionService } from '../src/subscription/subscription.service';
import { EmailService } from '../src/email/email.service';
import { WeatherService } from '../src/weather/weather.service';

describe('Weather Forecast API (e2e)', () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let configService: ConfigService;
  let moduleFixture: TestingModule;
  let mockEmailService: MockEmailService;
  let mockWeatherService: MockWeatherService;
  let subscriptionService: SubscriptionService;

  beforeAll(async () => {
    // Create a testing module with a test database
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test', // Use a test-specific env file
        }),
        AppModule,
      ],
    })
      .overrideProvider(EmailService)
      .useClass(MockEmailService)
      .overrideProvider(WeatherService)
      .useClass(MockWeatherService)
      .compile();

    app = moduleFixture.createNestApplication();
    configService = app.get<ConfigService>(ConfigService);
    
    // Get mock services
    mockEmailService = moduleFixture.get<MockEmailService>(EmailService);
    mockWeatherService = moduleFixture.get<MockWeatherService>(WeatherService);
    subscriptionService = moduleFixture.get<SubscriptionService>(SubscriptionService);
    
    // Set up validation pipes, the same as in the main app
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    // Set the global prefix to match the API spec
    app.setGlobalPrefix('api');
    
    await app.init();
    
    // Get the mongoose connection from the app
    mongoConnection = moduleFixture.get('DatabaseConnection');
  });

  beforeEach(async () => {
    // Clear database before each test
    const collections = mongoConnection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    // Clear mock emails
    mockEmailService.clearEmails();
  });

  afterAll(async () => {
    // Clean up
    if (mongoConnection) {
      await mongoConnection.close();
    }
    
    if (app) {
      await app.close();
    }
  });

  // Test getting weather data
  describe('GET /api/weather', () => {
    it('should return weather data for a valid city', () => {
      return request(app.getHttpServer())
        .get('/api/weather')
        .query({ city: 'Lviv' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('temperature');
          expect(res.body).toHaveProperty('humidity');
          expect(res.body).toHaveProperty('description');
        });
    });

    it('should return 400 for missing city parameter', () => {
      return request(app.getHttpServer())
        .get('/api/weather')
        .expect(400);
    });
  });

  // Test subscription flow
  describe('Subscription flow', () => {
    const testEmail = 'test@example.com';
    const testCity = 'Lviv';
    
    it('should create a subscription', () => {
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: testEmail,
          city: testCity,
          frequency: 'daily',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Subscription successful');
          
          // Check if confirmation email was sent
          const emails = mockEmailService.getAllEmails();
          expect(emails.length).toBe(1);
          expect(emails[0].to).toBe(testEmail);
          expect(emails[0].subject).toContain(testCity);
        });
    });

    it('should not allow duplicate subscriptions', async () => {
      // First subscription
      await request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: testEmail,
          city: testCity,
          frequency: 'daily',
        })
        .expect(200);
      
      // Duplicate subscription attempt
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: testEmail,
          city: testCity,
          frequency: 'hourly', // Even with different frequency
        })
        .expect(409); // Conflict
    });

    it('should validate subscription input', () => {
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: 'invalid-email', // Invalid email
          city: testCity,
          frequency: 'invalid-frequency', // Invalid frequency
        })
        .expect(400);
    });
    
    it('should confirm a subscription with valid token', async () => {
      // Create a subscription
      await request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: testEmail,
          city: testCity,
          frequency: 'daily',
        });
      
      // Get the confirmation token from the email
      const emails = mockEmailService.getAllEmails();
      const confirmEmailContent = emails[0].html;
      const tokenMatch = confirmEmailContent.match(/Confirmation token: ([a-f0-9-]+)/);
      const confirmationToken = tokenMatch ? tokenMatch[1] : null;
      
      expect(confirmationToken).toBeTruthy();
      
      // Confirm the subscription
      return request(app.getHttpServer())
        .get(`/api/confirm/${confirmationToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('confirmed successfully');
        });
    });
    
    it('should reject confirmation with invalid token', () => {
      const invalidToken = '00000000-0000-0000-0000-000000000000';
      
      return request(app.getHttpServer())
        .get(`/api/confirm/${invalidToken}`)
        .expect(400);
    });
    
    it('should unsubscribe with valid token', async () => {
      // Create and get a subscription
      await request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: testEmail,
          city: testCity,
          frequency: 'daily',
        });
      
      // Find the subscription in the database to get unsubscribe token
      const subscription = await subscriptionService['subscriptionModel'].findOne({
        email: testEmail,
        city: testCity,
      }).exec();
      
      expect(subscription).toBeTruthy();
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      const unsubscribeToken = subscription.unsubscribeToken;
      
      // Unsubscribe
      return request(app.getHttpServer())
        .get(`/api/unsubscribe/${unsubscribeToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Unsubscribed successfully');
        });
    });
    
    it('should reject unsubscribe with invalid token', () => {
      const invalidToken = '00000000-0000-0000-0000-000000000000';
      
      return request(app.getHttpServer())
        .get(`/api/unsubscribe/${invalidToken}`)
        .expect(404);
    });
  });

  // Test complete user flow
  describe('Complete user flow', () => {
    it('should handle the complete user journey', async () => {
      const testEmail = 'journey@example.com';
      const testCity = 'Kyiv';
      
      // Step 1: Check weather for a city
      const weatherResponse = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ city: testCity })
        .expect(200);
        
      expect(weatherResponse.body).toHaveProperty('temperature');
      
      // Step 2: Subscribe to weather updates
      await request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: testEmail,
          city: testCity,
          frequency: 'daily',
        })
        .expect(200);
      
      // Step 3: Get confirmation token from email
      const emails = mockEmailService.getAllEmails();
      const confirmEmailContent = emails[0].html;
      const tokenMatch = confirmEmailContent.match(/Confirmation token: ([a-f0-9-]+)/);
      const confirmationToken = tokenMatch ? tokenMatch[1] : null;
      
      expect(confirmationToken).toBeTruthy();
      
      // Step 4: Confirm subscription
      await request(app.getHttpServer())
        .get(`/api/confirm/${confirmationToken}`)
        .expect(200);
      
      // Step 5: Verify subscription is confirmed in database
      const subscription = await subscriptionService['subscriptionModel'].findOne({
        email: testEmail,
        city: testCity,
      }).exec();
      
      expect(subscription).toBeTruthy();
      if (subscription) {
        expect(subscription.confirmed).toBe(true);
      }
      
      // Step 6: Unsubscribe
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      await request(app.getHttpServer())
        .get(`/api/unsubscribe/${subscription.unsubscribeToken}`)
        .expect(200);
      
      // Step 7: Verify subscription is removed
      const deletedSubscription = await subscriptionService['subscriptionModel'].findOne({
        email: testEmail,
        city: testCity,
      }).exec();
      
      expect(deletedSubscription).toBeNull();
    });
  });
});