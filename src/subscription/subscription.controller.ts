import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscribeDto, TokenDto } from './dto/subscription.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('subscription')
@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subscribe to weather updates' })
  @ApiResponse({ status: 200, description: 'Subscription successful. Confirmation email sent.' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  async create(@Body() subscribeDto: SubscribeDto) {
    await this.subscriptionService.create(subscribeDto);
    return { message: 'Subscription successful. Confirmation email sent.' };
  }

  @Get('confirm/:token')
  @ApiOperation({ summary: 'Confirm email subscription' })
  @ApiResponse({ status: 200, description: 'Subscription confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async confirm(@Param() params: TokenDto) {
    await this.subscriptionService.confirm(params.token);
    return { message: 'Subscription confirmed successfully' };
  }

  @Get('unsubscribe/:token')
  @ApiOperation({ summary: 'Unsubscribe from weather updates' })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async unsubscribe(@Param() params: TokenDto) {
    await this.subscriptionService.unsubscribe(params.token);
    return { message: 'Unsubscribed successfully' };
  }
}