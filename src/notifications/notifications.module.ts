import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  imports: [MailerModule, FirebaseModule]
})
export class NotificationsModule {}
