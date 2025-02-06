import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { MangopayModule } from 'src/mangopay/mangopay.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { HttpModule } from '@nestjs/axios';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports:[FirebaseModule,MangopayModule,BlockchainModule,HttpModule,MailerModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
