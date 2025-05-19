# Weather Forecast API

Weather API application that allows users to subscribe to weather updates for their city. This application is built using Nest.js and MongoDB.

## Features

- Get current weather information for any city
- Subscribe to receive weather updates via email
- Choose between daily and hourly update frequencies
- Confirm subscription through a verification email
- Easily unsubscribe from updates

## API Endpoints

The API follows the OpenAPI/Swagger specification as described in the requirements:

- `GET /api/weather?city={city}` - Get current weather for a given city
- `POST /api/subscribe` - Subscribe a given email to weather updates
- `GET /api/confirm/{token}` - Confirm email subscription
- `GET /api/unsubscribe/{token}` - Unsubscribe from weather updates

### API Documentation

The API is documented using Swagger. Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/swagger
```

This provides an interactive interface to explore and test all the API endpoints.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [MongoDB](https://www.mongodb.com/) (if running locally without Docker)
- Weather API key from [WeatherAPI.com](https://www.weatherapi.com/)
- SMTP Server for sending emails (or use a service like Gmail, Mailjet, SendGrid, etc.)

## Installation

### Clone the repository

```bash
git clone https://github.com/your-username/weather-forecast-api.git
cd weather-forecast-api
```

### Set up environment variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Edit the `.env` file and add your credentials:

```env
# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/weather-api

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
EMAIL_FROM=weather@example.com

# Optional Email Configuration
EMAIL_POOL=false
EMAIL_MAX_CONNECTIONS=5
EMAIL_RATE_LIMIT=5

# Weather API Configuration
WEATHER_API_KEY=your-weather-api-key
WEATHER_API_URL=http://api.weatherapi.com/v1
```

### Email Configuration Options

The application uses Nodemailer to send emails. Here are the available configuration options:

- **EMAIL_HOST**: SMTP server hostname
- **EMAIL_PORT**: SMTP server port (usually 587 for TLS or 465 for SSL)
- **EMAIL_SECURE**: Set to 'true' if using port 465, otherwise 'false'
- **EMAIL_USER**: SMTP username/email
- **EMAIL_PASS**: SMTP password or app password
- **EMAIL_FROM**: Sender email address

#### Optional email settings:

- **EMAIL_POOL**: Set to 'true' to use connection pooling
- **EMAIL_MAX_CONNECTIONS**: Maximum number of connections in the pool
- **EMAIL_RATE_LIMIT**: Maximum number of messages per second

#### SMTP Provider Examples:

**Gmail:**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

**Mailjet:**
```
EMAIL_HOST=in-v3.mailjet.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-api-key
EMAIL_PASS=your-secret-key
```

**SendGrid:**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

## Running the Application

### Using Docker Compose (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
docker-compose up -d
```

This will start the API service on port 3000 and MongoDB on port 27017.

### Running Locally

If you prefer to run the application locally:

1. Install dependencies:

```bash
npm install
```

2. Make sure MongoDB is running locally

3. Start the application:

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Testing

### Unit Tests

Run the unit test suite:

```bash
npm test
```

Run the unit tests with coverage:

```bash
npm run test:cov
```

### End-to-End (E2E) Tests

The application includes comprehensive E2E tests that verify the complete user flow:

1. Getting weather data
2. Creating a subscription
3. Confirming a subscription
4. Unsubscribing from updates

To run the E2E tests:

```bash
npm run test:e2e
```

To run E2E tests with coverage:

```bash
npm run test:e2e:cov
```

To run E2E tests in watch mode (for development):

```bash
npm run test:e2e:watch
```

The E2E tests use:
- A separate test database (configured in `.env.test`)
- Mock implementations of the EmailService and WeatherService to avoid external API calls
- Automated cleanup before and after tests

## Project Structure

```
weather-forecast-api/
├── src/
│   ├── app.module.ts              # Main application module
│   ├── main.ts                    # Application entry point
│   ├── config/                    # Configuration files
│   ├── weather/                   # Weather module
│   ├── subscription/              # Subscription module
│   ├── email/                     # Email service module
│   └── scheduler/                 # Job scheduler module
├── test/                          # Test files
├── docker-compose.yml             # Docker Compose configuration
├── Dockerfile                     # Docker configuration
└── .env.example                   # Example environment variables
```

## Implementation Details

### Database

The application uses MongoDB for data storage with the following collections:

- **Subscriptions**: Stores user subscription information

#### Database Migrations

The application uses migrate-mongo for database migrations. Migrations are automatically run when the application starts.

To create a new migration manually:

```bash
npx migrate-mongo create "name-of-migration"
```

This will create a new migration file in the migrations directory. You can then edit this file to define the `up` and `down` functions.

To run migrations manually:

```bash
npx migrate-mongo up
```

To rollback the last migration:

```bash
npx migrate-mongo down
```

### External APIs

- **WeatherAPI.com**: Used to fetch current weather data for different cities

### Email Service

The application sends the following types of emails:

- Subscription confirmation emails
- Weather update emails (daily or hourly)

### Scheduler

The application includes a job scheduler that:

- Sends hourly weather updates to hourly subscribers
- Sends daily weather updates to daily subscribers at 8 AM

## License

This project is licensed under the MIT License.