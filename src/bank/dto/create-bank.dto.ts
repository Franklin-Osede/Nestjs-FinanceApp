import { IsNotEmpty, IsNumber, isNotEmpty } from "class-validator"
export class CreateBankDto {
    @IsNotEmpty()
    description: string;
    
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    reference:string;

    notifUrl:string;

    successLinkRedirect:string;
    
    successLinkRedirectMethod:string;
    
    @IsNotEmpty()
    customData:string;
}
