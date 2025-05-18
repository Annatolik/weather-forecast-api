import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';
import { SubscribeDto } from './dto/subscription.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    private emailService: EmailService,
  ) {}

  async create(subscribeDto: SubscribeDto): Promise<Subscription> {
    // Check if email is already subscribed to this city
    const existingSubscription = await this.subscriptionModel.findOne({
      email: subscribeDto.email,
      city: subscribeDto.city,
    }).exec();

    if (existingSubscription) {
      throw new HttpException('Email already subscribed', HttpStatus.CONFLICT);
    }

    // Create new subscription with tokens
    const newSubscription = new this.subscriptionModel({
      ...subscribeDto,
      confirmed: false,
      confirmationToken: uuidv4(),
      unsubscribeToken: uuidv4(),
    });

    // Save subscription to database
    const savedSubscription = await newSubscription.save();

    // Send confirmation email
    await this.emailService.sendConfirmationEmail(
      savedSubscription.email,
      savedSubscription.city,
      savedSubscription.confirmationToken,
    );

    return savedSubscription;
  }

  async confirm(token: string): Promise<void> {
    const subscription = await this.subscriptionModel.findOne({
      confirmationToken: token,
      confirmed: false,
    }).exec();

    if (!subscription) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    subscription.confirmed = true;
    await subscription.save();
  }

  async unsubscribe(token: string): Promise<void> {
    const subscription = await this.subscriptionModel.findOne({
      unsubscribeToken: token,
    }).exec();

    if (!subscription) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }

    await this.subscriptionModel.deleteOne({ unsubscribeToken: token }).exec();
  }

  async findAllConfirmedByFrequency(frequency: string): Promise<Subscription[]> {
    return this.subscriptionModel.find({
      confirmed: true,
      frequency,
    }).exec();
  }
}