import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsDto } from './dto/notifications.dto';
import { BasicAuthGuard } from 'src/authentication/authentication.guard';

@Controller('notifications')

export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {
  }

  @Post('/duplicated/email')
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  duplicateEmailNotification(@Body() notificationDto: NotificationsDto){
      // send duplicated email notification
    this.notificationsService.sendDuplicateEmailNotification(notificationDto)
    return;
  }

  @Post('/create/OTP')
  @HttpCode(201)
  createOTP(@Body() body:{email:string}){
    return this.notificationsService.createOTP(body.email)
  }
}
