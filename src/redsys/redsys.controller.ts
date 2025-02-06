import { Controller, Post, Body, InternalServerErrorException, BadRequestException, Res, HttpStatus, Get, Query, Redirect} from '@nestjs/common';
import { RedsysService } from './redsys.service';
import { CreatePaymentDTO } from './dto/create-payment.dto'
import { firstValueFrom,  } from 'rxjs';
import { PayloadDTO } from './dto/payload.dto';



@Controller('redsys')
export class RedsysController {

    constructor(private readonly redsysService: RedsysService){}

    @Post('/payment')
    createPayment(@Res() res ,@Body() paymentDTO:CreatePaymentDTO):PayloadDTO | any{
        try {
            const payment = this.redsysService.createPayment(paymentDTO);
            return res.status(HttpStatus.CREATED).json(payment);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error:error.message});
        }
    }

    @Get('/notification/success')
    @Redirect('https://app.domoblock.io/pago-exitoso')
    async successfullPayment(@Query() query){
        try {
            const decrypt = await this.redsysService.decryptPaymentResponse(query.data);
            if(decrypt.DS_MERCHANT_MERCHANTDATA){
                await this.redsysService.sendEmail(JSON.parse(decrypt.DS_MERCHANT_MERCHANTDATA));
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    @Get('/notification/failed')
    @Redirect('https://app.domoblock.io/pago-error')
    failedPayment(){}
}
