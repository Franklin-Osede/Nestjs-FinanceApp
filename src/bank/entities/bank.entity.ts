export interface customData{
   userEmail: string,
   projectName: string,
   tokenQuantity: number,
   tokenAddress: string,
   sellerAddress: string, 
   wallet?:string,
   byCompany:boolean;
   uid:string;
   displayName?:string;
}

export class Bank {
    singlePayinId:string;
    amount:number;
    codStatus:string;
    description:string;
    reference:string;
    debtorName:string;
    customData:customData;
    date:number;
    creditorAccount:string;
    debtorAccount: string;

    constructor(data){
        this.singlePayinId = data.singlePayinId;
        this.amount = data.amount;
        this.codStatus = data.codStatus;
        this.description = data.description;
        this.reference = data.reference;
        this.debtorName = data.debtorName;
        this.customData = JSON.parse(Buffer.from(data.customData,'base64').toString('ascii'));
        this.date = data.date;
        this.creditorAccount = data.creditorAccount;
        this.debtorAccount = data.debtorAccount;
    }


}
