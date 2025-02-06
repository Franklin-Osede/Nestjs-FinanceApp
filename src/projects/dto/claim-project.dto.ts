import { IsNotEmpty } from "class-validator";

export class claimDividendDto{
    @IsNotEmpty()
    userId:string
    @IsNotEmpty()
    projectId: string;
    @IsNotEmpty()
    userWallet:string;
}