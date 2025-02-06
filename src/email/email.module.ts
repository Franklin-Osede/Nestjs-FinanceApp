import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailService } from '@sendgrid/mail'
@Module({
    providers: [EmailService, MailService],
    exports: [EmailService],
})
export class EmailModule {}
