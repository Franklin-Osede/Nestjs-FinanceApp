import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class InvestProjectDto{
    @IsNotEmpty()
    userId:string
    @IsNotEmpty()
    projectId: string;
    userWallet:string;
    // @IsNotEmpty()
    // @IsPositive()
    // @IsNumber()
    // totalAmount: number;
    @IsNotEmpty()
    @IsNumber()
    totalTokens: number;
    // @IsNotEmpty()
    // sellerAddress: string;
}