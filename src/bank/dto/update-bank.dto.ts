import { IsNotEmpty } from 'class-validator'
export class UpdateBankDto {
    @IsNotEmpty()
    dataReturn:string;    
}
