import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedsysModule } from './redsys/redsys.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { BankModule } from './bank/bank.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import {join} from 'path'
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { Mangopay } from './mangopay/mangopay';
import { MangopayModule } from './mangopay/mangopay.module';
import { CreditcardModule } from './creditcard/creditcard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HttpModule } from '@nestjs/axios';
import { ProjectsModule } from './projects/projects.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
@Module({
  imports: [RedsysModule,ConfigModule.forRoot({
    isGlobal:true
  }),MailerModule.forRoot({
    transport:{
      host: 'smtp.gmail.com',
      // name: 'mail.domoblock.io',
      secure: true,
      port: 465,
      auth: {
        type: "OAuth2",
        user:'inversiones@domoblock.io',
        clientId:process.env.OAUTH_SECRET_ID,
        clientSecret:process.env.OAUTH_CLIENT_SECRET,
        refreshToken:process.env.CLIENT_REFRESH_TOKEN
      },
      tls : { rejectUnauthorized: false }
    },
  }),BankModule,
  ServeStaticModule.forRoot(
    {
      rootPath: join(process.cwd(),'./src/public'),
      serveStaticOptions:{
        cacheControl:true
      }
    }),
  FirebaseModule,
  HttpModule,
  BlockchainModule,
  MangopayModule,
  CreditcardModule,
  NotificationsModule,
  ProjectsModule,
  EmailModule],
  controllers: [AppController],
  providers: [AppService, Mangopay],
})
export class AppModule {}
