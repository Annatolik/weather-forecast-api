export default () => ({
  port: parseInt(process.env.PORT || '', 10) || 3000,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-api',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '', 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password',
    from: process.env.EMAIL_FROM || 'weather@example.com',
    // Додаткові налаштування для деяких SMTP-провайдерів
    pool: process.env.EMAIL_POOL === 'true',
    maxConnections: parseInt(process.env.EMAIL_MAX_CONNECTIONS || '', 10) || 5,
    rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT || '', 10) || 5,
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY || 'your-weather-api-key',
    apiUrl: process.env.WEATHER_API_URL || 'http://api.weatherapi.com/v1',
  },
  app: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  },
});