import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Run migrations when the application starts
    await this.runMigrations();
  }

  async runMigrations() {
    try {
      this.logger.log('Running database migrations...');
      
      // Set the MONGODB_URI environment variable for migrate-mongo
      process.env.MONGODB_URI = this.configService.get<string>('database.uri');
      
      // Import migrate-mongo dynamically
      const migrateMongo = require('migrate-mongo');
      
      // Get migrate-mongo config
      const configPath = path.join(process.cwd(), 'migrate-mongo-config.js');
      if (!fs.existsSync(configPath)) {
        this.logger.error(`Migration config file not found at ${configPath}`);
        return;
      }
      
      // Run migrations
      const { migrated, rolledback } = await migrateMongo.up();
      
      if (migrated.length > 0) {
        this.logger.log(`Migrated: ${migrated.join(', ')}`);
      } else {
        this.logger.log('No migrations to run - database is up-to-date');
      }
      
      if (rolledback.length > 0) {
        this.logger.warn(`Rolled back: ${rolledback.join(', ')}`);
      }
    } catch (error) {
      this.logger.error(`Error running migrations: ${error.message}`, error.stack);
    }
  }
}