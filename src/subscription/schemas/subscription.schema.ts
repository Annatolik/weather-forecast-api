import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @Prop({ required: true })
  email: string;

  @ApiProperty({
    description: 'City for weather updates',
    example: 'Lviv',
  })
  @Prop({ required: true })
  city: string;

  @ApiProperty({
    description: 'Frequency of updates',
    example: 'daily',
    enum: ['hourly', 'daily'],
  })
  @Prop({ required: true, enum: ['hourly', 'daily'] })
  frequency: string;

  @ApiProperty({
    description: 'Whether the subscription is confirmed',
    example: false,
  })
  @Prop({ required: true, default: false })
  confirmed: boolean;

  @ApiProperty({
    description: 'Confirmation token',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @Prop({ required: true })
  confirmationToken: string;

  @ApiProperty({
    description: 'Unsubscribe token',
    example: 'p6o5n4m3-l2k1-j0i9-h8g7-f6e5d4c3b2a1',
  })
  @Prop({ required: true })
  unsubscribeToken: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);