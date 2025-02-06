import { Inject, Injectable } from '@nestjs/common';
import { app, storage } from 'firebase-admin';

@Injectable()
export class FirebaseService {
  #db: FirebaseFirestore.Firestore;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.#db = firebaseApp.firestore();
  }

  getCollection(collection:'users' | 'bank' | 'usersWalletByCompany' | 'balance' | 'user-investments' | 'mangopay' | 'transactions-mangopay' | 'investments' | 'OTP' | 'dividends-mangopay' | 'dividends-user' | 'withdraws-mangopay' | 'user-tx-documents'){
    return this.#db.collection(collection);
  }
  getInvestmentBySellerAddress(address: string){
    return (this.#db.collection('investments').where('sellerAddress', '==', address).limit(1).get());
  }

  uploadPDFBucket(proyectId:string,uid:string,date:string,data){
    return storage(this.firebaseApp).bucket(`gs://domoblock-devnew.appspot.com`).upload(data,{
      metadata: {
        contentType: 'application/pdf',
      },
      destination: `user/${uid}/${proyectId}/${date}.pdf`
    })
  }

}