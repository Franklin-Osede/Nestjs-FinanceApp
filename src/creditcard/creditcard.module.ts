import { Module } from '@nestjs/common';
import { CreditcardService } from './creditcard.service';
import { CreditcardController } from './creditcard.controller';
import { MangopayModule } from 'src/mangopay/mangopay.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [MangopayModule, FirebaseModule],
  exports: [CreditcardService],
  controllers: [CreditcardController],
  providers: [CreditcardService],
})
export class CreditcardModule {}
