import { Injectable } from '@nestjs/common';
import { CreateCreditcardDto } from './dto/create-creditcard.dto';
import { UpdateCreditcardDto } from './dto/update-creditcard.dto';
import { Mangopay } from 'src/mangopay/mangopay';
import { CreditCard } from 'src/mangopay/interfaces/creditcard.class';
import { FirebaseService } from 'src/firebase/firebase';

@Injectable()
export class CreditcardService {

  private readonly authorId:string = process.env.MANGOPAY_USER_ID;
  constructor(private readonly mangopayProvider: Mangopay, private readonly firebaseService: FirebaseService) { }
  async create(createCreditcardDto: CreateCreditcardDto) {
    const cardRegistration = await this.mangopayProvider.createMangopayCardRegistration(createCreditcardDto.userId, createCreditcardDto.currency, createCreditcardDto.cardType);
    const data =
    {
      accessKeyRef: cardRegistration.AccessKey,
      preregistrationData: cardRegistration.PreregistrationData,
      cardCvx: createCreditcardDto.cardCvx,
      cardExpirationDate: createCreditcardDto.cardExpirationDate,
      cardNumber: createCreditcardDto.cardNumber
    }
    const creditCardData = new CreditCard(data)
    const token = await this.mangopayProvider.tokenizeCreditcard(creditCardData, cardRegistration.CardRegistrationURL);
    const cardValidated = await this.mangopayProvider.updateAndValidateCard(cardRegistration.Id,token?.data);
    await this.firebaseService.getCollection('mangopay').doc(createCreditcardDto.uid).set({creditCardId:cardValidated.CardId, cardRegistrationId: cardValidated.Id},{merge:true});
    return cardValidated;
  }

  generatePayment(paymentData) {
    const authorId = this.authorId;
    const amount = paymentData.amount;
    const fee = amount * 0.005;
    const total = paymentData.total;
    const walletId = paymentData.walletId;
    const cardType = paymentData.cardType;
    const webPayin = {
      AuthorId:authorId,
      DebitedFunds:{
        Currency:'EUR',
        Amount:total
      },
      Fees:{
        Amount:fee,
        Currency:'EUR'
      },
      CreditedWalletId:walletId,
      CardType:cardType,
      ReturnURL:'https://app.domoblock.io/pago-exitoso'
    }
    return this.mangopayProvider.generateCreditcardPaymentPage(webPayin);
  }

  findAll() {
    return `This action returns all creditcard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} creditcard`;
  }

  update(id: number, updateCreditcardDto: UpdateCreditcardDto) {
    return `This action updates a #${id} creditcard`;
  }

  remove(id: number) {
    return `This action removes a #${id} creditcard`;
  }
}
