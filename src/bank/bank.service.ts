import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { Bank } from './entities/bank.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MailerService } from '@nestjs-modules/mailer';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { FirebaseService } from 'src/firebase/firebase';
import { firestore } from 'firebase-admin'
import { EmailService } from 'src/email/email.service';
import { Mangopay } from 'src/mangopay/mangopay';
// import { UserMangoPay } from 'src/mangopay/interfaces/user.class';
import { FirebasePersonResponse } from 'src/firebase/interfaces/firebase.userresponse.interface';
import { FirebaseCompanyResponse } from 'src/firebase/interfaces/firebase.companyresponse.interface';
import { CreateWalletInterface } from 'src/mangopay/interfaces/wallet.class';
@Injectable()
export class BankService implements OnModuleInit{
  private readonly logger = new Logger('BankService');
  private readonly API_INESPAY:string = process.env.API_INESPAY;
  private readonly API_KEY_INESPAY:string = process.env.API_KEY_INESPAY;
  private readonly API_TOKEN_INESPAY:string = process.env.API_TOKEN_INESPAY;
  private readonly ADMIN_EMAIL:string = process.env.ADMIN_EMAIL || 'inversiones@domoblock.io';
  private readonly API_GENERATE_WALLET:string = process.env.API_GENERATE_WALLET;
  private readonly FIREBASE_API_CREDENTIALS:string = process.env.FIREBASE_API_CREDENTIALS;
  private readonly BASE_URL:string = process.env.BASE_URL;
  private readonly SUCCESS_URL:string = process.env.SUCCESS_URL;
  private readonly MANGOPAY_USER_ID:string = process.env.MANGOPAY_USER_ID;
  constructor(
    private readonly httpservice: HttpService, 
    private readonly emailservice: MailerService,
    private readonly blockchainService: BlockchainService,
    private readonly firebaseService: FirebaseService,
    private readonly sendgridService:EmailService,
    private readonly mangopayService: Mangopay
  ){}
  async onModuleInit() {
    this.logger.log('gmailoAuth Transported Created!');
    // const array = [];
    // array.length = 95
    // for await (const i of array) {
    //   await new Promise((resolve, reject) => {
    //    setTimeout(() => resolve(true),1000)
    //   }).then(()=>{
    //     this.sendEmailTest().then(()=> console.log(i))
    //   })
    // }
  }

  async create(createBankDto: CreateBankDto) {
    createBankDto.notifUrl = this.BASE_URL;
    createBankDto.successLinkRedirect = this.SUCCESS_URL || 'https://app.domoblock.io/pago-exitoso';
    createBankDto.successLinkRedirectMethod = "GET";
    console.log(createBankDto);
    const response = await this.httpservice.post(this.API_INESPAY, createBankDto,{
      headers:{
        "X-Api-Key":this.API_KEY_INESPAY,
        Authorization:this.API_TOKEN_INESPAY,
        "Content-Type":"application/json"
      }
    });
    const data = await firstValueFrom(response);
    return data;
  }

  async sendAdminEmailNotification(paymentDetails: Bank): Promise<void>{
    try {
      await this.sendgridService.send({
        from:this.ADMIN_EMAIL,
        to:'inversiones@domoblock.io',
        subject:`¡Nueva inversión por transferencia Bancaria!`,
        html:`<html><head><style type="text/css" id="operaUserStyle"></style></head><body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #292929;color: #FFFFFF">
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
          ${paymentDetails.customData.userEmail}
          </li>
          <li>
            <strong>Proyecto:</strong> 
            ${paymentDetails.customData.projectName}
          </li>
              <li>
                <strong>Tokens:</strong>
                 ${paymentDetails.customData.tokenQuantity}
              </li>
              <li>
                <strong>identificador del pago:</strong>
                 ${paymentDetails.singlePayinId}
              </li>
              <li>
                <strong>Importe:</strong>
                 ${ paymentDetails.amount / 100 } €
              </li>
              <li>
                <strong>Direccion del Token:</strong>
                 ${ paymentDetails.customData.tokenAddress }
              </li>
              <li>
                <strong>Direccion del Seller:</strong>
                 ${ paymentDetails.customData.sellerAddress }
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
      <p style="text-align:right" align="right"><a href="https://www.linkedin.com/in/sergio-navarro-pe%C3%B1aranda/" rel="noopener noreferrer" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.linkedin.com/in/sergio-navarro-pe%25C3%25B1aranda/&amp;source=gmail&amp;ust=1698935714800000&amp;usg=AOvVaw2VyIbZGJ32XY86QBszIrsU"><span style="font-size:13.5pt;font-family:'Arial',sans-serif;color:blue;background:#6a78d1;text-decoration:none; position:absolute;"><img id="m_-4744275875505186557v1v1Imagen_x0020_10" style="width:.25in;height:.25in" src="https://sendmail.domoblock.io/linkedin.png" alt="linkedin" width="24" height="24" border="0" data-image-whitelisted="" class="CToWUd" data-bit="iit"></span></a><span style="font-size:13.5pt;font-family:'Arial',sans-serif"></span></p>
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
    </body></html>`
      })
    } 
    catch (error) {
     console.log(error.message); 
    }
  }

  async sendUserNotification(paymentDetails: Bank){
    await this.sendgridService.send({
      to: paymentDetails.customData.userEmail,
      from: this.ADMIN_EMAIL,
      subject: `¡Inversión en ${paymentDetails.customData.projectName} completada!`, 
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
    <div><strong style="float:left">Hola, ${paymentDetails.debtorName ?? paymentDetails.customData.displayName ?? paymentDetails.customData.userEmail}.</strong>
      <br>
      <p style="text-align: justify;">
          La transacción en el proyecto ${paymentDetails.customData.projectName}  por valor de ${paymentDetails.amount / 100} € se ha procesado con éxito.
      </p>
      <p style="text-align: justify;">
        ¡Gracias por confiar en Domoblock, te mantendremos informado sobre los avances de la financiación y del transcurso del proyecto!
      </p>
        <p style="text-align: justify;">
        <strong>
        Saludos.
        </strong>
      </p>
  </div>
    </div>
      </h3>
      <br>
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
  <p style="text-align:right" align="right"><a href="https://www.linkedin.com/in/sergio-navarro-pe%C3%B1aranda/" rel="noopener noreferrer" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.linkedin.com/in/sergio-navarro-pe%25C3%25B1aranda/&amp;source=gmail&amp;ust=1698935714800000&amp;usg=AOvVaw2VyIbZGJ32XY86QBszIrsU"><span style="font-size:13.5pt;font-family:'Arial',sans-serif;color:blue;background:#6a78d1;text-decoration:none;position:absolute"><img id="m_-4744275875505186557v1v1Imagen_x0020_10" style="width:.25in;height:.25in" src="https://sendmail.domoblock.io/linkedin.png" alt="linkedin" width="24" height="24" border="1" data-image-blacklisted="" class="CToWUd" data-bit="iit"></span></a><span style="font-size:13.5pt;font-family:'Arial',sans-serif"></span></p>
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
  }

  async sendEmailTest(){
      const status = await this.sendgridService.send({
      to:['ramsesdma@gmail.com', 'javs1989@gmail.com'],
      from:this.ADMIN_EMAIL,
      subject:`¡Mensaje de Prueba DOMOBLOCK!`,
      text:'Mensaje de prueba MiT'})
      return status
  }

  async sendErrorNotification(payload:string , isDecoded:boolean = false ,decodeData?:Bank){
    try {
      await this.sendgridService.send({
        to:'inversiones@domoblock.io',
        from:this.ADMIN_EMAIL,
        subject: isDecoded ? 'Error en el minteo de tokens':'ERROR AL DECODIFICAR EL SIGUIENTE MENSAJE DE INESPAY',
        text: isDecoded ? `Ha ocurrido un error al mintear los tokens... los datos del usuario son los siguientes: ${decodeData.customData.userEmail}` : payload
      })
      if(isDecoded){
        await this.sendgridService.send({
          from:this.ADMIN_EMAIL,
          to:decodeData.customData.userEmail,
          subject:"Error registro de inversión",
          text:
          `Hola ${decodeData?.debtorName || decodeData.customData?.displayName || 'Usuario' } , tu inversión por valor de ${decodeData.amount/100} Euros en el proyecto "${decodeData.customData.projectName}" no se ha registrado con éxito. Esto puede deberse a dos motivos:1. La comunicación entre la plataforma y la pasarela de pagos ha fallado.2. En el momento que se ha intentado registrar tú inversión ya no quedaban suficientes participaciones.En cualquier de los casos, en unos minutos recibirás de vuelta el capital invertido en tu cuenta bancaria. Estamos haciendo mejoras en el sistema para evitar que en futuros proyectos se pueda dar alguna de estas situaciones. Gracias por tu comprensión y disculpa las molestias.`
        })
      }
    } catch (error) {  
      this.logger.error("ERROR SENDING PROBLEMS NOTIFICATIONS");
    }
  }

  async getFee(){
    return await this.blockchainService.getWalletStatus('0x32b73AF6745cb36d60c797957f171BfD5a79edf1');
  }

  async generateWallet(uid:string){
    const secretKeyData = (await this.firebaseService.getCollection('balance').doc(process.env.ADMIN_UID).get()).data();
    const secretKey = await this.blockchainService.decryptSecret(secretKeyData);
    const response = await firstValueFrom(await this.httpservice.post(this.API_GENERATE_WALLET,{userUid:uid},
      {  headers:{'Authorization': this.FIREBASE_API_CREDENTIALS }})) as any;
    const wallet = response?.data?.address || response.address;
    const isSigned = await this.blockchainService.getWalletStatus(wallet);
    if(isSigned != 1){
      await this.blockchainService.registerBlockchainWallet(secretKey,wallet);
      await this.firebaseService.getCollection('users').doc(uid).set({
        walletsWhitelist: firestore.FieldValue.arrayUnion(wallet)
      },{ merge:true});
  }

  return {wallet, message:"Wallet successfully added"}
}

  async MintNft(transferData: Bank){
    const secretKeyData = (await this.firebaseService.getCollection('balance').doc(process.env.ADMIN_UID).get()).data();
    const secretKey = await this.blockchainService.decryptSecret(secretKeyData);
    let isExternal = true;
    if(!transferData?.customData.wallet){
      const response = await firstValueFrom(await this.httpservice.post(this.API_GENERATE_WALLET,{userUid:transferData.customData.uid},{  headers:{'Authorization': this.FIREBASE_API_CREDENTIALS }})) as any;
      transferData.customData.wallet = response?.data?.address || response.address;
      isExternal = false;
      const isSigned = await this.blockchainService.getWalletStatus(transferData.customData.wallet);
      if(isSigned != 1){
        await this.blockchainService.registerBlockchainWallet(secretKey,transferData.customData.wallet);
        await this.firebaseService.getCollection('users').doc(transferData.customData.uid).set({
          walletsWhitelist: firestore.FieldValue.arrayUnion(transferData.customData.wallet),
          isInversor:true
        },{ merge:true});
      }
      }
      try {
        await this.blockchainService.mintToken(secretKey, transferData.customData, isExternal);
      } catch (error) {
        const secretKeyData = (await this.firebaseService.getCollection('balance').doc('18WJOtcCMnVzBul8YU2c2B40jVv2').get()).data();
        const secretKey = await this.blockchainService.decryptSecret(secretKeyData);
        await this.blockchainService.mintToken(secretKey, transferData.customData, isExternal);
      }
      await this.sendgridService.send({    
        to:'inversiones@domoblock.io',
        from:this.ADMIN_EMAIL,
        subject:`¡Minteo de tokens automaticos!`,
        text:`se ha realizado el minteo de ${transferData.customData.tokenQuantity} tokens del proyecto ${transferData.customData?.projectName} con direccion de token ${transferData.customData?.tokenAddress} al usuario ${transferData.customData?.userEmail} ${transferData.customData?.wallet}`})
      await this.sendUserNotification(transferData);
    return await this.firebaseService.getCollection('bank').doc(transferData.singlePayinId).set({uid:transferData.customData.uid });
  }

  async registerAccountNatural(uid:string){
    const mangoPayRef = await this.firebaseService.getCollection('mangopay').doc(uid).get();
    if(mangoPayRef.exists){
      const mangoPayData = await mangoPayRef.data();
      return await this.mangopayService.getAccountBalance(mangoPayData.walletId);
    }
    const userRef = (await this.firebaseService.getCollection('users').doc(uid).get()).data() as FirebasePersonResponse | FirebaseCompanyResponse;
    // const mangoPayCreation = new UserMangoPay(userRef);
    // const mangopayUser = await this.mangopayService.createMangopayUser(mangoPayCreation);
    const mangopayWallet = await this.createWalletNatural(userRef.uid,this.MANGOPAY_USER_ID);
    const mangopayVirtualIBAN = await this.createVirtualIBAN(uid, mangopayWallet.Id, 'particular' in userRef ? userRef?.particular?.nombre : userRef.displayName);
    await this.firebaseService.getCollection('mangopay').doc(uid).set({walletId: mangopayWallet.Id, virtualId: mangopayVirtualIBAN.Id});
    return mangopayWallet;
  }

  async createWalletNatural(uid:string, owner:string){
    const walletData = {
      Currency:"EUR",
      Description:uid,
      Owners:[owner],
      Tag:uid,
    } as CreateWalletInterface
    const mangopayWallet = await this.mangopayService.createMangopayWallet(walletData);
    return mangopayWallet;
  }

  async createVirtualIBAN(uid:string, wallet:string, ownerName:string){
    return await this.mangopayService.createVirtualIBAN(uid, wallet, ownerName); 
  }

  async getVirtualIban(uid:string){
    const mangopayUserRef = await this.firebaseService.getCollection('mangopay').doc(uid).get()
    if(!mangopayUserRef.exists)
      throw new HttpException('User IBAN Not Found',HttpStatus.NOT_FOUND);
    const mangopayUserData = await mangopayUserRef.data()
    return await this.mangopayService.getVirutalIbanByUserId(mangopayUserData.virtualId);
  }


  async getBalance(walletId:string){
    return await this.mangopayService.getAccountBalance(walletId)
  }

  async createWithdraw(uid:string, bankAccount:string,amount:number){
    const mangopayUserRef = await this.firebaseService.getCollection('mangopay').doc(uid).get();
    if(!mangopayUserRef.exists)
      throw new HttpException('User not found',HttpStatus.NOT_FOUND);
    const userRef = await this.firebaseService.getCollection('users').doc(uid).get();
    if(!userRef.exists)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const userData = userRef.data();
    const mangopayUserData = mangopayUserRef.data();
    const balanceData = await this.mangopayService.getAccountBalance(mangopayUserData.walletId);
    if(balanceData.Balance.Amount < amount)
      throw new HttpException('Insufficient funds', HttpStatus.BAD_REQUEST);
    await this.mangopayService.transferFundsWallet(mangopayUserData?.walletId,amount);
    const id = Date.now()
    return await this.firebaseService.getCollection('withdraws-mangopay').doc(`${id}`).set({
      withdrawId:`${id}`,
      userId:uid,
      userEmail:userData.email,
      status:'pending',
      amount,
      account:bankAccount,
      date:new Date()
    })
  }

  async approveWithdraw(withdrawId: string, approved: boolean) {
    const withdrawRef = await this.firebaseService.getCollection('withdraws-mangopay').doc(withdrawId).get();
    if(!withdrawRef.exists)
      throw new HttpException('Withdrawal not found', HttpStatus.NOT_FOUND);
    if(!approved)
      return await this.firebaseService.getCollection('withdraws-mangopay').doc(withdrawRef.id).set({
        status:'denied',
        updatedAt: new Date()
      },{merge:true});
    const withdrawData = withdrawRef.data();
    const userRef = await this.firebaseService.getCollection('users').doc(withdrawData.userId).get();
    if(!userRef.exists)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const mangopayRef = await this.firebaseService.getCollection('mangopay').doc(userRef.id).get();
    const mangopayData = mangopayRef.data();
    if(!mangopayData?.bankId){
      const userData = userRef.data() as FirebasePersonResponse | FirebaseCompanyResponse;
      const bankId = await this.mangopayService.createBankAccount(userData);
      await this.firebaseService.getCollection('mangopay').doc(userData.uid).set({bankId:bankId.Id},{merge:true});
      mangopayData.bankId = bankId.Id;
    }
    await this.mangopayService.withdrawMoney({
      bankId:mangopayData.bankId,
      amount:withdrawData.amount
    });
    await this.firebaseService.getCollection('withdraws-mangopay').doc(withdrawRef.id).set({
      status:'approved',
      updatedAt: new Date()
    },{merge:true});
    return withdrawData;
    // await this.mangopayService.transferFunds()
  }

  async getWalletMovements(userId:string, type:string = 'PAYIN'){
    switch(type){
      case 'PAYIN':{
        const userMangoPayRef = await this.firebaseService.getCollection('mangopay').doc(userId).get();
        if(!userMangoPayRef.exists)
          throw new HttpException('User not found',HttpStatus.NOT_FOUND);
        const userMangoPayData = userMangoPayRef.data();
        return (await this.mangopayService.getWalletTransactions(userMangoPayData?.walletId)).map((tx)=>{
          const transaction = {
            id:tx.Id,
            type:tx.Type,
            status:tx.Status,
            date:tx.CreationDate,
            amount:tx.CreditedFunds?.Amount,
            executionDate:tx.ExecutionDate,
            creditedFunds:tx.CreditedFunds.Amount,
          };
          return transaction;
        });
      }
      case 'TRANSFER':{
        const userRef = await this.firebaseService.getCollection('users').doc(userId).get();
        if(!userRef.exists)
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const transactionRef = await this.firebaseService.getCollection('transactions-mangopay').where('user','==',userRef.id).get();
        return await Promise.all(transactionRef.docs.map(async doc =>{
          const transactionData = doc.data()
          const projectRef = await this.firebaseService.getCollection('investments').doc(transactionData.project).get();
          transactionData.project = projectRef.data();
          return transactionData
        }));
      }
      case 'PAYOUT':{
        const userRef = await this.firebaseService.getCollection('users').doc(userId).get();
        if(!userRef.exists)
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const withdrawRef = await this.firebaseService.getCollection('withdraws-mangopay').where('userId','==',userRef.id).get();
        return withdrawRef.docs.map((doc)=>{
        const data = doc.data()
        data.date = new Date(data.date._seconds * 1000)
        return data;
        });
      }

      case 'DIVIDENDS':{
        const userRef = await this.firebaseService.getCollection('users').doc(userId).get();
        if(!userRef.exists)
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const dividendsWithdrawRef = await this.firebaseService.getCollection('dividends-mangopay').where('usersClaimed','array-contains',userRef.id).get();
        return dividendsWithdrawRef.docs.map((doc)=> doc.data());
      }
      default:{
        throw new HttpException('Type must be PAYIN, TRANSFER or PAYOUT', HttpStatus.BAD_REQUEST);
      }
    }
  }

  // findAll() {
  //   return `This action returns all bank`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} bank`;
  // }

  // update(id: number, updateBankDto: UpdateBankDto) {
  //   return `This action updates a #${id} bank`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} bank`;
  // }
}
