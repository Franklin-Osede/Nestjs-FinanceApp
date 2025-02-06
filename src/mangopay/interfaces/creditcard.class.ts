export class CreditCard{
    accessKeyRef: string;
    cardCvx: string;
    cardExpirationDate: string;
    cardNumber: string;
    data: string;
    constructor(data){
        this.accessKeyRef = data.accessKeyRef;
        this.cardCvx = data.cardCvx;
        this.cardExpirationDate = data.cardExpirationDate;
        this.cardNumber = data.cardNumber;
        this.data = data.preregistrationData;
    }
}