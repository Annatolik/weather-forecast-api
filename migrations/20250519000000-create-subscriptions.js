module.exports = {
  async up(db, client) {
    // Creating the subscriptions collection with schema validation
    await db.createCollection('subscriptions', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'city', 'frequency', 'confirmed', 'confirmationToken', 'unsubscribeToken'],
          properties: {
            email: {
              bsonType: 'string',
              description: 'Email address must be a string and is required'
            },
            city: {
              bsonType: 'string',
              description: 'City must be a string and is required'
            },
            frequency: {
              bsonType: 'string',
              enum: ['hourly', 'daily'],
              description: 'Frequency must be either hourly or daily and is required'
            },
            confirmed: {
              bsonType: 'bool',
              description: 'Confirmed status must be a boolean and is required'
            },
            confirmationToken: {
              bsonType: 'string',
              description: 'Confirmation token must be a string and is required'
            },
            unsubscribeToken: {
              bsonType: 'string',
              description: 'Unsubscribe token must be a string and is required'
            },
            createdAt: {
              bsonType: 'date',
              description: 'Creation timestamp'
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Last update timestamp'
            }
          }
        }
      }
    });

    // Create indexes
    await db.collection('subscriptions').createIndex({ email: 1, city: 1 }, { unique: true });
    await db.collection('subscriptions').createIndex({ confirmationToken: 1 }, { unique: true });
    await db.collection('subscriptions').createIndex({ unsubscribeToken: 1 }, { unique: true });
    await db.collection('subscriptions').createIndex({ frequency: 1, confirmed: 1 });
  },

  async down(db, client) {
    // Drop the subscriptions collection
    await db.collection('subscriptions').drop();
  }
};