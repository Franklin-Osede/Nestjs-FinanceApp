import { Injectable } from '@nestjs/common';
import * as mangopay from 'mangopay2-nodejs-sdk'
import { UserMangoPay } from './interfaces/user.class';
import { CreateWalletInterface } from './interfaces/wallet.class';
import { HttpService } from '@nestjs/axios';
import { CreditCard } from './interfaces/creditcard.class';
import { firstValueFrom } from 'rxjs';
import { bankAccount } from 'mangopay2-nodejs-sdk';
import { FirebaseCompanyResponse } from 'src/firebase/interfaces/firebase.companyresponse.interface';
import { FirebasePersonResponse } from 'src/firebase/interfaces/firebase.userresponse.interface';
import {Utils} from '../utils/utils'
@Injectable()
export class Mangopay {
    createBankAccount(userData: FirebasePersonResponse | FirebaseCompanyResponse) {
        const country = Utils.getIsoCountry('particular' in userData ? userData.particular.pais_de_residencia : userData.Empresa.Representante.pais_de_residencia);
        const data:bankAccount.IBANDetails = {
            IBAN:userData.bankAccount,
            OwnerName: ('particular' in userData ? userData.particular.nombre : userData.Empresa.Representante.nombre) ?? userData.displayName ,
            BIC:'BNPAFRPP',
            Type:'IBAN',
            OwnerAddress:{

                AddressLine1: ('particular' in userData ? userData.particular.domicilio : userData.Empresa.Representante.domicilio) ?? 'Someplace',
            
                AddressLine2: null,
            
                City: 'Someplace',
            
                Region: '',
            
                PostalCode: ('particular' in userData ? userData.particular.codigo_postal : userData.Empresa.Representante.codigo_postal) || '75000',
            
                Country: country as mangopay.CountryISO,
            
              }
        }
      return this.mangoInstance.Users.createBankAccount(this.MANGOPAY_PROJECTS_ID,data)
    }
    
    private mangoInstance: mangopay;
    private clientId: string = process.env.MANGOPAY_CLIENT_ID;
    private apikey: string = process.env.MANGOPAY_APIKEY;
    private baseUrl: string = process.env.MANGOPAY_BASE_URL;
    private MANGOPAY_USER_ID = process.env.MANGOPAY_USER_ID;
    private MANGOPAY_PROJECTS_ID = process.env.MANGOPAY_PROJECTS_ID;
    constructor(private readonly httpService: HttpService){
        console.log(this.apikey,this.clientId, this.baseUrl)
        this.mangoInstance = new mangopay({
            clientId: this.clientId,
            clientApiKey:this.apikey,
            baseUrl:this.baseUrl
        })
    }
    
    createMangopayUser(user:UserMangoPay){
        return this.mangoInstance.Users.create(user);
    }
    
    getUserData(userId){
        return this.mangoInstance.Users.get(userId);
    }
    createMangopayWallet(mangopayWallet: CreateWalletInterface) {
        return this.mangoInstance.Wallets.create({
            Owners: mangopayWallet.Owners,
            Description: mangopayWallet.Description,
            Currency: mangopayWallet.Currency as mangopay.CurrencyISO,
            Tag: mangopayWallet.Tag
        });
    }
    
    createVirtualIBAN(uid:string, WalletId:string, ownerName:string) {
        return this.mangoInstance.BankingAliases.create({
            Country: 'ES',
            Type: 'IBAN',
            OwnerName:ownerName,
            WalletId,
            Tag:uid
        })
    }
    
    createMangopayCardRegistration(userId: string, currency: string, cardType: string) {
        return this.mangoInstance.CardRegistrations.create({
            UserId:userId,
            Currency:currency as mangopay.CurrencyISO,
            CardType:cardType as mangopay.card.CardType
        });
    }
    
    async tokenizeCreditcard(creditCard: CreditCard, registrationURL:string){
        const params = new URLSearchParams();
        params.set('accessKeyRef',creditCard.accessKeyRef);
        params.set('data', creditCard.data);
        params.set('cardNumber', creditCard.cardNumber);
        params.set('cardExpirationDate', creditCard.cardExpirationDate);
        params.set('cardCvx', creditCard.cardCvx);
        return firstValueFrom(this.httpService.post(registrationURL,params));
    }

    transferFunds(userId:string,projectId:string, amount:number) {
        return this.mangoInstance.Transfers.create({
            AuthorId:this.MANGOPAY_USER_ID,
            CreditedWalletId:projectId,
            DebitedFunds: {
                Currency: 'EUR',
                Amount:amount 
            },
            DebitedWalletId:userId,
            Tag:`Investment from user ${userId} to project ${projectId}`,
            Fees:{
                Amount:0,
                Currency:'EUR'
            }
        });
    }

    transferFundsWallet(userId:string, amount :number) {
        return this.mangoInstance.Transfers.create({
            AuthorId:this.MANGOPAY_USER_ID,
            CreditedWalletId:'wlt_m_01JBCHBN602VNE78CQJ2Q60QTH',
            DebitedFunds: {
                Currency: 'EUR',
                Amount:amount 
            },
            DebitedWalletId:userId,
            Tag:`Transfer funds to withdraw wallet`,
            Fees:{
                Amount:0,
                Currency:'EUR'
            }
        });
    }

    transferFundsProjects(projectId:string,userId:string, amount:number){
        return this.mangoInstance.Transfers.create({
            AuthorId:this.MANGOPAY_PROJECTS_ID,
            CreditedWalletId:userId,
            DebitedFunds: {
                Currency: 'EUR',
                Amount:amount 
            },
            DebitedWalletId:projectId,
            Tag:`Transfer from Project ${projectId} to user ${userId}`,
            Fees:{
                Amount:0,
                Currency:'EUR'
            }
        });
    }
    
    updateAndValidateCard(cardRegistrationId: string, token:any) {
        return this.mangoInstance.CardRegistrations.update({
            Id:cardRegistrationId,
            RegistrationData:token
        });
    }
    
    getVirutalIbanByUserId(bankingAliasID:string) { return this.mangoInstance.BankingAliases.get(bankingAliasID)}
    
    getAccountBalance(walletId:string) {
        return this.mangoInstance.Wallets.get(walletId);
    }

    generateCreditcardPaymentPage(webPayin: { AuthorId: any; DebitedFunds: { Currency: string; Amount: any; }; Fees: { Amount: number; Currency: string; }; CreditedWalletId: any; ReturnURL: string; CardType:string; }) {
        return this.mangoInstance.PayIns.create({
            PaymentType:'CARD',
            AuthorId: webPayin.AuthorId,
            DebitedFunds:{
                Amount:webPayin.DebitedFunds.Amount,
                Currency: webPayin.Fees.Currency as mangopay.CurrencyISO
            },
            Fees:{
                Amount:webPayin.Fees.Amount,
                Currency: webPayin.Fees.Currency as mangopay.CurrencyISO
            },
            CreditedWalletId: webPayin.CreditedWalletId,
            ReturnURL: webPayin.ReturnURL,
            CardType: webPayin.CardType as mangopay.card.CardType,
            Culture:'ES',
            ExecutionType:'WEB'
        });
    }

    withdrawMoney(payload:any) {
        return this.mangoInstance.PayOuts.create({
            PaymentType:'BANK_WIRE',
            PayoutModeRequested:'STANDARD',
            DebitedWalletId:'wlt_m_01JBCHBN602VNE78CQJ2Q60QTH',
            AuthorId:this.MANGOPAY_PROJECTS_ID,
            BankAccountId: payload.bankId,
            DebitedFunds:{
                Amount:payload.amount,
                Currency:'EUR'
            },
            Fees:{
                Amount:0,
                Currency:'EUR'
            }
            
        })    
    }

    getWalletTransactions(walletId:string){
        return this.mangoInstance.Wallets.getTransactions(walletId,{
            parameters:{
                Type:'PAYIN'
            }
        });
    }
}
