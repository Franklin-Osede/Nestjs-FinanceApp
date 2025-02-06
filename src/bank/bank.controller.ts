import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Query, OnModuleInit, Inject, HttpException, Put } from '@nestjs/common';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity'
import { sanitizeString } from '../utils/sanitizer.util'
@Controller('bank')
export class BankController{
  constructor(private readonly bankService: BankService) {}

  @Post('/create-payment')
  create(@Res() res,@Body() createBankDto: CreateBankDto) {
    this.bankService.create(createBankDto).then(response=>{
      return res.status(HttpStatus.CREATED).json(response.data)
    }).catch(error => {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message:"Unexpected error ocurred while creating payment",reason:error.message})
    })
  }

  @Post('/confirm-payment')
  async confirmPayment(@Res() res,@Body() payload: UpdateBankDto){
    try {
      console.log(payload.dataReturn);
      const decode = new Bank(JSON.parse(sanitizeString(Buffer.from(payload.dataReturn,'base64').toString('ascii'))));
      await this.bankService.sendAdminEmailNotification(decode);
      this.bankService.MintNft(decode).then(()=>console.log('process completed successfully')).catch(async (err)=>{
        await this.bankService.sendErrorNotification(payload.dataReturn, true, decode);
        console.log('error minting');
        console.log(`${err.message}`);
      });
      return res.status(HttpStatus.ACCEPTED).json({message:"ok"})
    } catch (error) {
      this.bankService.sendErrorNotification(payload.dataReturn);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message:error.message});
    }
  }
  // @Get()
  // findAll() {
  //   return this.bankService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.bankService.findOne(+id);
  // }

  @Patch('/create/wallet/:id')
  update(@Param('id') id: string) {
    return this.bankService.generateWallet(id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.bankService.remove(+id);
  // }

  @Get('/create-email')
  async sendEmail(){
    return this.bankService.sendEmailTest();
  }

  @Get('/fee')
  async getFee(){
    return {data:await this.bankService.getFee()}
  }

  @Get('/account/natural/:uid')
  registerUser(@Param('uid') uid:string){
    return this.bankService.registerAccountNatural(uid);
  }

  @Get('/account/iban/:uid')
  getUserVirtualIBan(@Param('uid') uid:string){
    return this.bankService.getVirtualIban(uid);
  }

  @Get('/balance/:wallet')
  getBalance(@Param('wallet') wallet:string){
    return this.bankService.getBalance(wallet);
  }

  @Post('/withdraw/create')
  createWithdraw(@Body('uid') uid:string,@Body('account') account:string,@Body('amount') amount:number){
    return this.bankService.createWithdraw(uid,account,amount);
  }

  @Patch('/withdraw/approve')
  approveWithdraw(@Body('withdrawId') withdrawId:string, @Body('approved') approved:boolean){
    return this.bankService.approveWithdraw(withdrawId,approved);
  }

  @Get('/movement/:userId')
  getMovements(@Param('userId') userId:string, @Query('type') type:string){
    return this.bankService.getWalletMovements(userId, type);
  }
}
