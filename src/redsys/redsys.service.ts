import { Injectable } from '@nestjs/common';
// @ts-ignore
import { Redsys } from 'node-redsys-api';
import { CreatePaymentDTO } from "./dto/create-payment.dto"
import { PayloadDTO } from "./dto/payload.dto"
import { RedsysPayment } from "./entity/redsys.entity"
import { DecryptedPayment } from "./entity/payment.entity"
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { MailerService } from '@nestjs-modules/mailer';
import { CURRENCIES, SANDBOX_URLS, TRANSACTION_TYPES, createRedsysAPI } from 'redsys-easy';

const {
  createRedirectForm
} = createRedsysAPI({
  urls: SANDBOX_URLS,
  secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7'
});


@Injectable()
export class RedsysService {
    constructor(private readonly httpService: HttpService, private readonly mailService: MailerService){}
    createPayment(payment: CreatePaymentDTO) {
        const redsys = new Redsys();
        const mParams = new RedsysPayment();
        mParams.DS_MERCHANT_TRANSACTIONTYPE = "0";
        mParams.DS_MERCHANT_MERCHANTCODE = "340490630";
        mParams.DS_MERCHANT_ORDER = new Date().getTime().toString().substring(0,12);
        mParams.DS_MERCHANT_TERMINAL = "1";
        mParams.DS_MERCHANT_CURRENCY = "978";
        mParams.DS_MERCHANT_AMOUNT = payment.amount;
        mParams.DS_MERCHANT_MERCHANTDATA = JSON.stringify(payment)
        mParams.DS_MERCHANT_MERCHANTURL= "https://sendmail.domoblock.io/redsys";
        const metadata = redsys.createMerchantParameters(mParams);
        mParams.DS_MERCHANT_URLKO= "https://sendmail.domoblock.io/redsys/notification/failed";
        mParams.DS_MERCHANT_URLOK= `https://sendmail.domoblock.io/redsys/notification/success?data=${metadata}`;
        const form = createRedirectForm({
          DS_MERCHANT_MERCHANTDATA:mParams.DS_MERCHANT_MERCHANTDATA,
          DS_MERCHANT_MERCHANTCODE: '340490630',
          DS_MERCHANT_TERMINAL: '1',
          DS_MERCHANT_TRANSACTIONTYPE: TRANSACTION_TYPES.AUTHORIZATION, // '0'
          DS_MERCHANT_ORDER: mParams.DS_MERCHANT_ORDER,
          // amount in smallest currency unit(cents)
          DS_MERCHANT_AMOUNT: mParams.DS_MERCHANT_AMOUNT,
          DS_MERCHANT_CURRENCY: CURRENCIES.EUR.num,
          DS_MERCHANT_MERCHANTNAME: 'Domoblock',
          DS_MERCHANT_MERCHANTURL: mParams.DS_MERCHANT_MERCHANTURL,
          DS_MERCHANT_URLOK: mParams.DS_MERCHANT_URLOK,
          DS_MERCHANT_URLKO: mParams.DS_MERCHANT_URLOK
        })
        return form;
    }

    async sendPaymentRequest(data:PayloadDTO):Promise<Observable<AxiosResponse<PayloadDTO>>>{
        const response = await this.httpService.post('https://sis-t.redsys.es:25443/sis/rest/trataPeticionREST',data);
        return response;
    }
    
    async initializePaymentRequest(data:PayloadDTO):Promise<Observable<AxiosResponse<PayloadDTO>>>{
        const response = await this.httpService.post('https://sis-t.redsys.es:25443/sis/rest/iniciaPeticionREST',data);
        return response;
    }

    async decryptPaymentResponse(data:string):Promise<RedsysPayment>{
        const redsys = new Redsys();
        const serverResponse:RedsysPayment = await redsys.decodeMerchantParameters(data);
        return serverResponse;
    }
    
    async sendEmail(paymentDTO:CreatePaymentDTO): Promise<void>{
        try {         
            const email_user = await this.mailService.sendMail({
                to: paymentDTO.email,
                from: {
                  name:'Domoblock',
                  address:'inversiones@domoblock.io'
                },
                subject: `¡Inversión en ${paymentDTO.project} completada!`, 
                html: `<html><head><style type="text/css" id="operaUserStyle"></style></head><body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #fff;color: #000">
                <!--[if IE]><div class="ie-container"><![endif]-->
                <!--[if mso]><div class="mso-container"><![endif]-->
                <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #000;width:100%" cellpadding="0" cellspacing="0">
                <tbody>
                <tr style="vertical-align: top">
                  <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->
                  
              
              <div class="u-row-container" style="padding: 0px;background-color: #fff">
                <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                  <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]-->
                    
              <!--[if (mso)|(IE)]><td align="center" width="500" style="width: 500px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
              <div class="u-col u-col-100" style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
                <div style="height: 100%;width: 100% !important;">
                <!--[if (!mso)&(!IE)]><!--><div style="height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
                
              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody>
                  <tr>
                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                      
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right: 0px;padding-left: 0px;" align="center">
                    
                    <img align="center" border="0" src="https://sendmail.domoblock.io/domoblock.png" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 200px;"/>
                    
                  </td>
                </tr>
              </table>
              
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <table style="font-family:helvetica,arial,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody>
                  <tr>
                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:helvetica,arial,sans-serif;" align="left">
                      
                <h3 style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: Thin; font-family: 'Helvetica',sans-serif; font-size: 16px;">
                  <div>
              <div><strong style="float:left">Hola, ${paymentDTO.name}.</strong>
                <br>
                <p style="text-align: justify;">
                    La transacción en el proyecto ${paymentDTO.project} se ha completado con éxito, en breves registraremos tú inversión por valor de ${(+paymentDTO.amount)/100} euros.
                </p>
            </div>
              </div>
                </h3>
                <div>
                    <p style="text-align:justify; font-size:smaller; line-height: 2;">        
                        Importante: Las transacciones son registradas por orden de llegada, aunque es importante tener en cuenta que, en momentos de alta demanda, es posible que la financiación del proyecto se complete antes de que podamos atender todas las solicitudes. 
                    </p>
                    <p style="text-align:justify; font-size:smaller; font-family: Helvetica,Arial, sans-serif; line-height: 2;">   
                        En estos casos, te notificaremos por correo electrónico y te reembolsaremos el monto total a tu cuenta bancaria.
            
                    </p>
                    <p style="text-align:justify; font-size:smaller; font-family: Helvetica,Arial, sans-serif; line-height: 2;">        
            
                        ¡Gracias por confiar en Domoblock, te mantendremos al tanto de los avances de la financiación y del proyecto!
                </p>            
                <p style="text-align:justify; font-size:smaller">        
                    Un saludo.
                </p>
                </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody>
                  <tr>
                  </tr>
                 
                </tbody>
              </table>     
              
                <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
                </div>
              </div>
              <!--[if (mso)|(IE)]></td><![endif]-->
                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                  </div>
                </div>
              </div>
              
              
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  </td>
                </tr>
                </tbody>
                </table>
                <!--[if mso]></div><![endif]-->
                <!--[if IE]></div><![endif]-->
                <hr>
                <!-- <div>
                  <h1 style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: arial,helvetica,sans-serif; font-size: 30px;">
                    <div><a href="#" style="text-decoration: none; color:#FFFFFF">Privacy Policy</a></div>
                  </h1>
                </div> -->
            
            <table style="background:transparent" border="0" cellspacing="0" cellpadding="0">
            <tbody>
            <tr>
            <td style="padding:5px">
            <table border="0" cellspacing="0" cellpadding="0">
            <tbody>
            <tr>
            <td style="padding:0cm 0cm 0cm 0cm">
            <p><strong><span style="font-family:'Arial',sans-serif;color:black">Eric Jimenez</span></strong></p>
            <p style="line-height:16.5pt"><span style="font-size:10.5pt;font-family:'Arial',sans-serif;color:black">Customer Success&nbsp;|&nbsp;Domoblock</span></p>
            </td>
            <td style="width:11.25pt;padding:0cm 0cm 0cm 0cm" width="15">&nbsp;</td>
            <td style="width:.75pt;border:none;border-left:solid #ff9600 1.0pt;padding:0cm 0cm 0cm 0cm" width="1">&nbsp;</td>
            <td style="width:11.25pt;padding:0cm 0cm 0cm 0cm" width="15">&nbsp;</td>
            <td style="padding:0cm 0cm 0cm 0cm">
            <table border="0" cellspacing="0" cellpadding="0">
            <tbody>
            <tr style="height:18.75pt">
            <td style="width:22.5pt;padding:0cm 0cm 0cm 0cm;height:18.75pt" width="30">
            <table border="0" cellspacing="0" cellpadding="0">
            <tbody>
            <tr>
            <td style="padding:0cm 0cm 0cm 0cm" valign="bottom">
            <p><span style="font-size:13.5pt;font-family:'Arial',sans-serif;color:black;background:#ff9600"><img id="m_-4744275875505186557v1v1Imagen_x0020_1" style="width:.1354in;height:.1354in" src="https://mail.google.com/mail/u/0?ui=2&amp;ik=e998cc86e3&amp;attid=0.1.1&amp;permmsgid=msg-f:1781365489482158956&amp;th=18b8ae797fb9536c&amp;view=fimg&amp;fur=ip&amp;sz=s0-l75-ft&amp;attbid=ANGjdJ84EnhMSWdr3N3QVBSFDEk7xwRLf1VbxF8NzDcoFU4fEOLwSW1jTpwZ3RDWhhaoniU6lF4M2Bygr4v_yTUZ0GFrSKVemmtR-GCzt9Yhopd6VOMC2HclVuyWVXU&amp;disp=emb" width="13" height="13" data-image-blacklisted="" class="CToWUd" data-bit="iit"></span><span></span></p>
            </td>
            </tr>
            </tbody>
            </table>
            </td>
            <td style="padding:0cm 0cm 0cm 0cm;height:18.75pt">
            <p><span style="font-size:9.0pt;font-family:'Arial',sans-serif;color:black">(+34) 690 842 648</span></p>
            </td>
            </tr>
            <tr style="height:18.75pt">
            <td style="width:22.5pt;padding:0cm 0cm 0cm 0cm;height:18.75pt" width="30">
            <table border="0" cellspacing="0" cellpadding="0">
            <tbody>
            <tr>
            <td style="padding:0cm 0cm 0cm 0cm" valign="bottom">
            <p><span style="font-size:13.5pt;font-family:'Arial',sans-serif;color:black;background:#ff9600"><img id="m_-4744275875505186557v1v1Imagen_x0020_2" style="width:.1354in;height:.1354in" src="https://mail.google.com/mail/u/0?ui=2&amp;ik=e998cc86e3&amp;attid=0.1.2&amp;permmsgid=msg-f:1781365489482158956&amp;th=18b8ae797fb9536c&amp;view=fimg&amp;fur=ip&amp;sz=s0-l75-ft&amp;attbid=ANGjdJ9wUdotf5Xsh-GPuZjqB3wz4U0ueSV8qRiyN5HUuY5TrDv_qDkxDBKz42W5jBP6EM3K9efM1Jt4lXNzP9NdDQxITFdHnx8GamGilP8KvjQ-WXShQCAe8ycd7yU&amp;disp=emb" width="13" height="13" data-image-blacklisted="" class="CToWUd" data-bit="iit"></span><span></span></p>
            </td>
            </tr>
            </tbody>
            </table>
            </td>
            <td style="padding:0cm 0cm 0cm 0cm;height:18.75pt">
            <p><span style="font-size:9.0pt"><a href="mailto:eric@domoblock.io" rel="noreferrer" target="_blank"><span style="font-family:'Arial',sans-serif;color:black">eric@domoblock.io</span></a></span><span style="font-size:13.5pt;font-family:'Arial',sans-serif"></span></p>
            </td>
            </tr>
            <tr style="height:18.75pt">
            <td style="width:22.5pt;padding:0cm 0cm 0cm 0cm;height:18.75pt" width="30">
            <table border="0" cellspacing="0" cellpadding="0">
            <tbody>
            <tr>
            <td style="padding:0cm 0cm 0cm 0cm" valign="bottom">
            <p><span style="font-size:13.5pt;font-family:'Arial',sans-serif;color:black;background:#ff9600"><img id="m_-4744275875505186557v1v1Imagen_x0020_3" style="width:.1354in;height:.1354in" src="https://mail.google.com/mail/u/0?ui=2&amp;ik=e998cc86e3&amp;attid=0.1.3&amp;permmsgid=msg-f:1781365489482158956&amp;th=18b8ae797fb9536c&amp;view=fimg&amp;fur=ip&amp;sz=s0-l75-ft&amp;attbid=ANGjdJ8fEoR6vsokhmH95zgV0kTscz174sJzQ11YgBkeUwnpyWCWvFJWr-ciKZ5S7mzh7_KgaIQVBwAD26WkzBlLnHG5VvYSgmZ2gglmPP6o3JClwYRogveA1Q4lLTU&amp;disp=emb" width="13" height="13" border="0" data-image-blacklisted="" class="CToWUd" data-bit="iit"></span><span></span></p>
            </td>
            </tr>
            </tbody>
            </table>
            </td>
            <td style="padding:0cm 0cm 0cm 0cm;height:18.75pt">
            <p><span style="font-size:13.5pt;font-family:'Arial',sans-serif"><a href="https://domoblock.io/" rel="noopener noreferrer" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://domoblock.io/&amp;source=gmail&amp;ust=1698935714800000&amp;usg=AOvVaw2ewKFmK8_kRPRysKuIvGzx"><span style="font-size:9.0pt;color:black">https://domoblock.io/</span></a></span></p>
            </td>
            </tr>
            </tbody>
            </table>
            </td>
            </tr>
            </tbody>
            </table>
            </td>
            <td style="padding:0cm 0cm 0cm 0cm">
            <table border="0" cellspacing="0" cellpadding="0">
            <tbody>
            
            </tbody>
            </table>
            </td></tr>
            <tr style="height:22.5pt">
            <td style="padding:0cm 0cm 0cm 0cm;height:22.5pt">&nbsp;</td>
            </tr>
            <tr style="height:.75pt">
            <td style="width:900pt;border:none;border-bottom:solid #ff9600 1.0pt;padding:0cm 0cm 0cm 0cm;height:.75pt" width="404">&nbsp;</td>
            </tr>
            <tr style="height:22.5pt">
            <td style="padding:0cm 0cm 0cm 0cm;height:22.5pt">&nbsp;</td>
            </tr>
            <tr>
            <td style="padding:0cm 0cm 0cm 0cm">
            <table style="width:302.75pt" border="0" width="404" cellspacing="0" cellpadding="0">
            <tbody>
            <tr>
            <td style="padding:0cm 0cm 0cm 0cm" valign="top">
            <p><span style="font-size:13.5pt;font-family:'Arial',sans-serif"><img id="m_-4744275875505186557v1v1Imagen_x0020_4" style="width:1.3541in;height:.4166in" src="https://sendmail.domoblock.io/domoblock.png" width="130" height="40" border="0" data-image-blacklisted="" class="CToWUd" data-bit="iit"></span><span style="font-size:13.5pt;font-family:'Arial',sans-serif"></span></p>
            </td>
            <td style="padding:0cm 0cm 0cm 0cm" valign="top">
            <div align="right">
            <table border="0" cellspacing="0" cellpadding="0">
            <tbody>
            <tr>
            <td style="padding:0cm 0cm 0cm 0cm">
            <p style="text-align:right" align="right"><a href="https://www.linkedin.com/in/sergio-navarro-pe%C3%B1aranda/" rel="noopener noreferrer" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.linkedin.com/in/sergio-navarro-pe%25C3%25B1aranda/&amp;source=gmail&amp;ust=1698935714800000&amp;usg=AOvVaw2VyIbZGJ32XY86QBszIrsU"><span style="font-size:13.5pt;font-family:'Arial',sans-serif;color:blue;background:#6a78d1;text-decoration:none;position:absolute;"><img id="m_-4744275875505186557v1v1Imagen_x0020_10" style="width:.25in;height:.25in" src="https://sendmail.domoblock.io/linkedin.png" alt="linkedin" width="24" height="24" border="0" data-image-blacklisted="" class="CToWUd" data-bit="iit"></span></a><span style="font-size:13.5pt;font-family:'Arial',sans-serif"></span></p>
            </td>
            <td style="width:3.75pt;padding:0cm 0cm 0cm 0cm" width="5">&nbsp;</td>
            </tr>
            </tbody>
            </table>
            </div>
            </td>
            </tr>
            </tbody>
            </table>
            </td>
            </tr>
            <tr style="height:22.5pt">
            <td style="padding:0cm 0cm 0cm 0cm;height:22.5pt">&nbsp;</td>
            </tr>
            <tr>
            <td style="padding:0cm 0cm 0cm 0cm">&nbsp;</td>
            </tr>
            </tbody>
            </table>
            <p><em><span style="font-family:'Calibri Light',sans-serif;color:black">"Este mensaje&nbsp;y, en su caso, cualquier fichero anexo al mismo, contiene información de carácter personal y confidencial&nbsp;exclusivamente dirigida a su destinatario o destinatarios y propiedad de DOMOBLOCK REAL ESTATE INVESTMENT, S.L. Queda prohibida su&nbsp;divulgación, copia o distribución a terceros sin la previa autorización escrita de&nbsp;DOMOBLOCK REAL ESTATE INVESTMENT, S.L. en virtud de la&nbsp;legislación vigente.&nbsp;&nbsp;</span></em><em><span style="font-family:'Calibri Light',sans-serif;color:black"><br><br></span></em><em><span style="font-family:'Calibri Light',sans-serif;color:black">Sus datos provienen de un fichero titularidad de&nbsp;DOMOBLOCK REAL ESTATE INVESTMENT, S.L., con&nbsp; C.I.F.&nbsp;B-16865487, y domicilio&nbsp;social en Calle Presen Sáez de Descatllar 2, 3º, Puerta 12, 46018 - Valencia que&nbsp;serán tratados con la única finalidad de mantenimiento de la relación adquirida con usted.</span></em><em><span style="font-family:'Calibri Light',sans-serif;color:black"><br><br></span></em><em><span style="font-family:'Calibri Light',sans-serif;color:black">Puede ejercer sus derechos en materia de privacidad poniéndose en contacto con nosotros en la siguiente dirección de correo postal: calle Presen Sáez de Descatllar 2, 3º, Puerta 12, 46018 - Valencia o&nbsp;enviando un correo electrónico a la dirección <a href="mailto:info@domblock.io" rel="noreferrer" target="_blank">info@domblock.io</a></span></em></p>
            <p><em><span style="font-family:'Calibri Light',sans-serif;color:black">Si Ud. no es el destinatario y recibe este mail por error, rogamos se ponga en contacto con nosotros y destruya de inmediato el mail por&nbsp;error recibido con todos sus documentos adjuntos sin leerlos ni hacer ningún uso de los datos que en ellos figuren, ateniéndose a las&nbsp;consecuencias que de un uso indebido de dichos datos puedan derivarse.</span></em><span style="font-family:'Calibri Light',sans-serif;color:black">”</span></p>
            </body></html>`, 
              });
              console.log(email_user);
            const emailAdmin = await this.mailService.sendMail({
                to: 'inversiones@domoblock.io', 
                from: 'inversiones@domoblock.io', 
                subject: '¡Nueva inversión con tarjeta de crédito!', 
                html: `<html><head><style type="text/css" id="operaUserStyle"></style></head><body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #292929;color: #FFFFFF">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tbody><tr>
                    <td style="padding-right: 0px;padding-left: 0px; padding:10px;" align="center">
                      
                      <img align="center" border="0" src="https://assets-global.website-files.com/63c68ae79f353a81787bee4c/63da13445695c3d929f43050_logo-domoblock-original.png" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 200px; padding-top:10px;">
                      
                    </td>
                  </tr>
                </tbody></table>
                <div class="u-row" style="padding-top:5px; padding-bottom:10px; Margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                  <div style="padding-top:5px; padding-bottom:10px; padding-left: 4rem; Margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent"><strong>Datos sobre la compra:</strong></div>
                  <ul style="width:70%; margin:auto;">
                  <li>
                  <strong>Usuario:</strong> 
                  ${paymentDTO.email}
                  </li>
                  <li>
                    <strong>Proyecto:</strong> 
                    ${paymentDTO.project}
                  </li>
                      <li>
                        <strong>Tokens:</strong>
                         ${paymentDTO.quantity}
                      </li>
                      <li>
                        <strong>Importe:</strong>
                         ${Number(paymentDTO.amount)/100} €
                      </li>
                      <li>
                        <strong>Direccion del contrato de venta:</strong>
                         ${paymentDTO.contractAddress}
                      </li>
                      <li>
                        <strong>Direccion del contrato del token:</strong>
                         ${paymentDTO.tokenAddress}
                      </li>
                    </ul>
                  </div>
                  <hr>
              
              <table style="background:transparent" border="0" cellspacing="0" cellpadding="0">
              <tbody>
              <tr>
              <td style="padding:5px">
              <table border="0" cellspacing="0" cellpadding="0">
              <tbody>
              <tr>
              <td style="padding:0cm 0cm 0cm 0cm">
              <p><strong><span style="font-family:'Arial',sans-serif;color:white">Eric Jimenez</span></strong></p>
              <p style="line-height:16.5pt"><span style="font-size:10.5pt;font-family:'Arial',sans-serif;color:white">Customer Success&nbsp;|&nbsp;Domoblock</span></p>
              </td>
              <td style="width:11.25pt;padding:0cm 0cm 0cm 0cm" width="15">&nbsp;</td>
              <td style="width:.75pt;border:none;border-left:solid #ff9600 1.0pt;padding:0cm 0cm 0cm 0cm" width="1">&nbsp;</td>
              <td style="width:11.25pt;padding:0cm 0cm 0cm 0cm" width="15">&nbsp;</td>
              <td style="padding:0cm 0cm 0cm 0cm">
              <table border="0" cellspacing="0" cellpadding="0">
              <tbody>
              <tr style="height:18.75pt">
              <td style="width:22.5pt;padding:0cm 0cm 0cm 0cm;height:18.75pt" width="30">
              <table border="0" cellspacing="0" cellpadding="0">
              <tbody>
              <tr>
              <td style="padding:0cm 0cm 0cm 0cm" valign="bottom">
              <p><span style="font-size:13.5pt;font-family:'Arial',sans-serif;color:white;background:#ff9600"><img id="m_-4744275875505186557v1v1Imagen_x0020_1" style="width:.1354in;height:.1354in" src="https://mail.google.com/mail/u/0?ui=2&amp;ik=e998cc86e3&amp;attid=0.1.1&amp;permmsgid=msg-f:1781365489482158956&amp;th=18b8ae797fb9536c&amp;view=fimg&amp;fur=ip&amp;sz=s0-l75-ft&amp;attbid=ANGjdJ84EnhMSWdr3N3QVBSFDEk7xwRLf1VbxF8NzDcoFU4fEOLwSW1jTpwZ3RDWhhaoniU6lF4M2Bygr4v_yTUZ0GFrSKVemmtR-GCzt9Yhopd6VOMC2HclVuyWVXU&amp;disp=emb" width="13" height="13" data-image-whitelisted="" class="CToWUd" data-bit="iit"></span><span></span></p>
              </td>
              </tr>
              </tbody>
              </table>
              </td>
              <td style="padding:0cm 0cm 0cm 0cm;height:18.75pt">
              <p><span style="font-size:9.0pt;font-family:'Arial',sans-serif;color:white">(+34) 690 842 648</span></p>
              </td>
              </tr>
              <tr style="height:18.75pt">
              <td style="width:22.5pt;padding:0cm 0cm 0cm 0cm;height:18.75pt" width="30">
              <table border="0" cellspacing="0" cellpadding="0">
              <tbody>
              <tr>
              <td style="padding:0cm 0cm 0cm 0cm" valign="bottom">
              <p><span style="font-size:13.5pt;font-family:'Arial',sans-serif;color:white;background:#ff9600"><img id="m_-4744275875505186557v1v1Imagen_x0020_2" style="width:.1354in;height:.1354in" src="https://mail.google.com/mail/u/0?ui=2&amp;ik=e998cc86e3&amp;attid=0.1.2&amp;permmsgid=msg-f:1781365489482158956&amp;th=18b8ae797fb9536c&amp;view=fimg&amp;fur=ip&amp;sz=s0-l75-ft&amp;attbid=ANGjdJ9wUdotf5Xsh-GPuZjqB3wz4U0ueSV8qRiyN5HUuY5TrDv_qDkxDBKz42W5jBP6EM3K9efM1Jt4lXNzP9NdDQxITFdHnx8GamGilP8KvjQ-WXShQCAe8ycd7yU&amp;disp=emb" width="13" height="13" data-image-whitelisted="" class="CToWUd" data-bit="iit"></span><span></span></p>
              </td>
              </tr>
              </tbody>
              </table>
              </td>
              <td style="padding:0cm 0cm 0cm 0cm;height:18.75pt">
              <p><span style="font-size:9.0pt"><a href="mailto:eric@domoblock.io" rel="noreferrer" target="_blank"><span style="font-family:'Arial',sans-serif;color:white">eric@domoblock.io</span></a></span><span style="font-size:13.5pt;font-family:'Arial',sans-serif"></span></p>
              </td>
              </tr>
              <tr style="height:18.75pt">
              <td style="width:22.5pt;padding:0cm 0cm 0cm 0cm;height:18.75pt" width="30">
              <table border="0" cellspacing="0" cellpadding="0">
              <tbody>
              <tr>
              <td style="padding:0cm 0cm 0cm 0cm" valign="bottom">
              <p><span style="font-size:13.5pt;font-family:'Arial',sans-serif;color:white;background:#ff9600"><img id="m_-4744275875505186557v1v1Imagen_x0020_3" style="width:.1354in;height:.1354in" src="https://mail.google.com/mail/u/0?ui=2&amp;ik=e998cc86e3&amp;attid=0.1.3&amp;permmsgid=msg-f:1781365489482158956&amp;th=18b8ae797fb9536c&amp;view=fimg&amp;fur=ip&amp;sz=s0-l75-ft&amp;attbid=ANGjdJ8fEoR6vsokhmH95zgV0kTscz174sJzQ11YgBkeUwnpyWCWvFJWr-ciKZ5S7mzh7_KgaIQVBwAD26WkzBlLnHG5VvYSgmZ2gglmPP6o3JClwYRogveA1Q4lLTU&amp;disp=emb" width="13" height="13" border="0" data-image-whitelisted="" class="CToWUd" data-bit="iit"></span><span></span></p>
              </td>
              </tr>
              </tbody>
              </table>
              </td>
              <td style="padding:0cm 0cm 0cm 0cm;height:18.75pt">
              <p><span style="font-size:13.5pt;font-family:'Arial',sans-serif"><a href="https://domoblock.io/" rel="noopener noreferrer" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://domoblock.io/&amp;source=gmail&amp;ust=1698935714800000&amp;usg=AOvVaw2ewKFmK8_kRPRysKuIvGzx"><span style="font-size:9.0pt;color:white">https://domoblock.io/</span></a></span></p>
              </td>
              </tr>
              </tbody>
              </table>
              </td>
              </tr>
              </tbody>
              </table>
              </td>
              <td style="padding:0cm 0cm 0cm 0cm">
              <table border="0" cellspacing="0" cellpadding="0">
              <tbody>
              
              </tbody>
              </table>
              </td></tr>
              <tr style="height:22.5pt">
              <td style="padding:0cm 0cm 0cm 0cm;height:22.5pt">&nbsp;</td>
              </tr>
              <tr style="height:.75pt">
              <td style="width:900pt;border:none;border-bottom:solid #ff9600 1.0pt;padding:0cm 0cm 0cm 0cm;height:.75pt" width="404">&nbsp;</td>
              </tr>
              <tr style="height:22.5pt">
              <td style="padding:0cm 0cm 0cm 0cm;height:22.5pt">&nbsp;</td>
              </tr>
              <tr>
              <td style="padding:0cm 0cm 0cm 0cm">
              <table style="width:302.75pt" border="0" width="404" cellspacing="0" cellpadding="0">
              <tbody>
              <tr>
              <td style="padding:0cm 0cm 0cm 0cm" valign="top">
              <p><span style="font-size:13.5pt;font-family:'Arial',sans-serif"><img id="m_-4744275875505186557v1v1Imagen_x0020_4" style="width:1.3541in;height:.4166in" src="https://sendmail.domoblock.io/domoblock.png" width="130" height="40" border="0" data-image-whitelisted="" class="CToWUd" data-bit="iit"></span><span style="font-size:13.5pt;font-family:'Arial',sans-serif"></span></p>
              </td>
              <td style="padding:0cm 0cm 0cm 0cm" valign="top">
              <div align="right">
              <table border="0" cellspacing="0" cellpadding="0">
              <tbody>
              <tr>
              <td style="padding:0cm 0cm 0cm 0cm">
              <p style="text-align:right" align="right"><a href="https://www.linkedin.com/in/sergio-navarro-pe%C3%B1aranda/" rel="noopener noreferrer" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.linkedin.com/in/sergio-navarro-pe%25C3%25B1aranda/&amp;source=gmail&amp;ust=1698935714800000&amp;usg=AOvVaw2VyIbZGJ32XY86QBszIrsU"><span style="font-size:13.5pt;font-family:'Arial',sans-serif;color:blue;background:#6a78d1;text-decoration:none;position:absolute;"><img id="m_-4744275875505186557v1v1Imagen_x0020_10" style="width:.25in;height:.25in" src="https://sendmail.domoblock.io/linkedin.png" alt="linkedin" width="24" height="24" border="0" data-image-whitelisted="" class="CToWUd" data-bit="iit"></span></a><span style="font-size:13.5pt;font-family:'Arial',sans-serif"></span></p>
              </td>
              <td style="width:3.75pt;padding:0cm 0cm 0cm 0cm" width="5">&nbsp;</td>
              </tr>
              </tbody>
              </table>
              </div>
              </td>
              </tr>
              </tbody>
              </table>
              </td>
              </tr>
              <tr style="height:22.5pt">
              <td style="padding:0cm 0cm 0cm 0cm;height:22.5pt">&nbsp;</td>
              </tr>
              <tr>
              <td style="padding:0cm 0cm 0cm 0cm">&nbsp;</td>
              </tr>
              </tbody>
              </table>
              <p><em><span style="font-family:'Calibri Light',sans-serif;color:white">"Este mensaje&nbsp;y, en su caso, cualquier fichero anexo al mismo, contiene información de carácter personal y confidencial&nbsp;exclusivamente dirigida a su destinatario o destinatarios y propiedad de DOMOBLOCK REAL ESTATE INVESTMENT, S.L. Queda prohibida su&nbsp;divulgación, copia o distribución a terceros sin la previa autorización escrita de&nbsp;DOMOBLOCK REAL ESTATE INVESTMENT, S.L. en virtud de la&nbsp;legislación vigente.&nbsp;&nbsp;</span></em><em><span style="font-family:'Calibri Light',sans-serif;color:white"><br><br></span></em><em><span style="font-family:'Calibri Light',sans-serif;color:white">Sus datos provienen de un fichero titularidad de&nbsp;DOMOBLOCK REAL ESTATE INVESTMENT, S.L., con&nbsp; C.I.F.&nbsp;B-16865487, y domicilio&nbsp;social en Calle Presen Sáez de Descatllar 2, 3º, Puerta 12, 46018 - Valencia que&nbsp;serán tratados con la única finalidad de mantenimiento de la relación adquirida con usted.</span></em><em><span style="font-family:'Calibri Light',sans-serif;color:white"><br><br></span></em><em><span style="font-family:'Calibri Light',sans-serif;color:white">Puede ejercer sus derechos en materia de privacidad poniéndose en contacto con nosotros en la siguiente dirección de correo postal: calle Presen Sáez de Descatllar 2, 3º, Puerta 12, 46018 - Valencia o&nbsp;enviando un correo electrónico a la dirección <a href="mailto:info@domblock.io" rel="noreferrer" target="_blank">info@domblock.io</a></span></em></p>
              <p><em><span style="font-family:'Calibri Light',sans-serif;color:white">Si Ud. no es el destinatario y recibe este mail por error, rogamos se ponga en contacto con nosotros y destruya de inmediato el mail por&nbsp;error recibido con todos sus documentos adjuntos sin leerlos ni hacer ningún uso de los datos que en ellos figuren, ateniéndose a las&nbsp;consecuencias que de un uso indebido de dichos datos puedan derivarse.</span></em><span style="font-family:'Calibri Light',sans-serif;color:white">”</span></p>
            </body></html>`, // HTML body content
              });
              console.log(emailAdmin);
        } catch (error) {
            console.log(error.message);
        }
    }

}
