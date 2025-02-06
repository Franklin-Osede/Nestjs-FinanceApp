import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { HttpModule } from '@nestjs/axios'
import { MailerModule } from '@nestjs-modules/mailer';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module'
import { EmailModule } from 'src/email/email.module';
import { MangopayModule } from 'src/mangopay/mangopay.module';
@Module({
  imports:[HttpModule,MailerModule,FirebaseModule,BlockchainModule,EmailModule, MangopayModule],
  controllers: [BankController],
  providers: [BankService],
})
export class BankModule {}
