import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsString } from 'class-validator';
export class CreatePaymentDTO {
  @IsNotEmpty()
  @IsString()
  readonly name: string;
  @IsNotEmpty()
  readonly project: string;
  @IsNotEmpty()
  @IsNumberString()
  readonly amount: string;
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
  @IsNotEmpty()
  @IsNumber()
  readonly quantity: number;
  @IsNotEmpty()
  @IsString()
  readonly contractAddress: string;
  @IsNotEmpty()
  @IsString()
  readonly tokenAddress: string;
  }