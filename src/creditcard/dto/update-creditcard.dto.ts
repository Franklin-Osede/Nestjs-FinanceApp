import { PartialType } from '@nestjs/mapped-types';
import { CreateCreditcardDto } from './create-creditcard.dto';

export class UpdateCreditcardDto extends PartialType(CreateCreditcardDto) {}
