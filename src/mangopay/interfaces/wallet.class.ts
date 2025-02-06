export class Wallet{
    private currency: string = 'EUR';
    private owner: string;
    private description: string;
    private tag: string;
    private balance: number;
    private fundsType: string;
    private creationDate: number;
    constructor(data){
        this.owner = data.Owners;
        this.description = data.Description;
        this.tag = data.tag;
        this.balance = data.Balance;
        this.fundsType = data.FundsType;
    }
}

export interface CreateWalletInterface{
    Owners:[string];
    Currency:string;
    Description:string;
    Tag: string;
}