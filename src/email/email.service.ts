import { Injectable, Logger } from '@nestjs/common';
import { MailService, ClientResponse, MailDataRequired } from '@sendgrid/mail';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly SEND_GRID_API_KEY:string = process.env.SEND_GRID_API_KEY;

    constructor(
        private readonly mailService: MailService
    ) {
        this.mailService.setApiKey(this.SEND_GRID_API_KEY);
    }

    async send(mail: MailDataRequired): Promise<[ClientResponse, {}]> {
        const clientResponse= await this.mailService.send(mail);
        this.logger.log(`E-Mail sent to ${mail.to}`);
        return clientResponse;
    }
}
