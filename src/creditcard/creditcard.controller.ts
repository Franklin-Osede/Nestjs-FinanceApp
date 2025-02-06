import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreditcardService } from './creditcard.service';
import { CreateCreditcardDto } from './dto/create-creditcard.dto';
import { UpdateCreditcardDto } from './dto/update-creditcard.dto';

@Controller('creditcard')
export class CreditcardController {
  constructor(private readonly creditcardService: CreditcardService) {}

  @Post('/create')
  create(@Body() createCreditcardDto: CreateCreditcardDto) {
    return this.creditcardService.create(createCreditcardDto);
  }

  @Post('/generate/payment')
  generatePayment(@Body() payment: any){
    return this.creditcardService.generatePayment(payment);
  }
  @Get()
  findAll() {
    return this.creditcardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditcardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCreditcardDto: UpdateCreditcardDto) {
    return this.creditcardService.update(+id, updateCreditcardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditcardService.remove(+id);
  }
}
