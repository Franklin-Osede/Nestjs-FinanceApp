import { IsEnum, IsNotEmpty } from "class-validator"

export enum queryType{
    PAYIN = 'PAYIN',
    PAYOUT = 'PAYOUT',
    TRANSFER = 'TRANSFER'
}

export class QueryTransactionDto {
    @IsNotEmpty()
    userId: string;
    @IsNotEmpty()
    @IsEnum(queryType)
    Type: string;
}
