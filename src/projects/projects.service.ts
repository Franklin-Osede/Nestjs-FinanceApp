import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FirebaseService } from '../firebase/firebase'
import { Mangopay } from 'src/mangopay/mangopay';
import { InvestProjectDto } from './dto/invest-project.dto';
import { FirebasePersonResponse } from 'src/firebase/interfaces/firebase.userresponse.interface';
import { FirebaseCompanyResponse } from 'src/firebase/interfaces/firebase.companyresponse.interface';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { firestore } from 'firebase-admin';
import { MailerService } from '@nestjs-modules/mailer';
import { Utils } from '../utils/utils'
import { claimDividendDto } from './dto/claim-project.dto';
import { PDFDocument } from 'pdf-lib'
import * as path from 'path';
import * as fs from 'fs';
@Injectable()
export class ProjectsService implements OnModuleInit {
  private readonly MANGOPAY_PROJECTS_ID: string = process.env.MANGOPAY_PROJECTS_ID;
  private readonly API_GENERATE_WALLET: string = process.env.API_GENERATE_WALLET;
  private readonly FIREBASE_API_CREDENTIALS:string = process.env.FIREBASE_API_CREDENTIALS;
  private readonly ADMIN_EMAIL:string = process.env.ADMIN_EMAIL;
  private readonly DIVIDENDS_WALLET:string = process.env.MANGOPAY_WALLET_DIVIDENDS;
  private PDF_DOCUMENT;
  constructor(private readonly firebaseService: FirebaseService, 
    private readonly mangopayService: Mangopay, 
    private readonly blockchainService: BlockchainService,
    private readonly httpService: HttpService,
    private readonly emailservice: MailerService){}

  async onModuleInit(){
    const pdfPath = path.join(process.cwd(),'./src/public/documento.pdf')
    const exists = fs.existsSync(pdfPath)
    if(exists){
      const data = fs.readFileSync(pdfPath);
      const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      this.PDF_DOCUMENT = arrayBuffer;
      // await this.firebaseService.uploadPDFBucket('tzMHWjQNCdaC9W1Zs1zmyJE7oun2',path.join(process.cwd(),`./src/public/test.pdf`));
    }
    // const user = 'wlt_m_01J5X8Z7XTX15MPT8Y4CB9WXCS'
    // const project = 'wlt_m_01J744KB9QP2E5PREH0WDXWYHN';
    // const transferStatus = await this.mangopayService.transferFunds(user,project,100000);
    // console.log(transferStatus);
  }
  create(createProjectDto: CreateProjectDto) {
    return 'This action adds a new project';
  }

  findAll() {
    return `This action returns all projects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  async getProjectBalance(id:string){
    const investmentRef = await this.firebaseService.getCollection('investments').where('tokensAddress','==',id).get();
    if(investmentRef.empty)
      throw new HttpException('Investment does not exist', HttpStatus.NOT_FOUND);
    const projectTransactions = await this.firebaseService.getCollection('transactions-mangopay').where('project','==',investmentRef.docs[0].id).get()
    const investmentData = investmentRef.docs[0].data();
    let balance = 0;
    const amountCollectedData = projectTransactions.docs.map((userTransaction)=>{
      const userTransactionData = userTransaction.data();
      balance+=Number(userTransactionData.amount);
      return {
        amount:userTransactionData.amount,
        retention:userTransactionData.retention
      }
    })
    // const data = await this.mangopayService.getAccountBalance(investmentData.projectWallet);
    const responseData = {
      totalInvested:(investmentData.amountSold * investmentData.priceToken),
      balance,
      title: investmentData.title,
      description: investmentData.nameTokens,
      image: investmentData.mainImage,
      amountCollectedData
    }
    return responseData;
  }

  async claimDividend(claimDto: claimDividendDto){
    const userRef = await this.firebaseService.getCollection('users').doc(claimDto.userId).get();
    if(!userRef.exists)
      throw new HttpException('User not Found',HttpStatus.NOT_FOUND);
    const userWallet = await (await this.firebaseService.getCollection('mangopay').doc(userRef.id).get()).data().walletId;
    const dividendsRef = await this.firebaseService.getCollection("dividends-mangopay").doc(claimDto.projectId).get();
    if(!dividendsRef.exists)
      throw new HttpException('Dividends not Found',HttpStatus.BAD_REQUEST);
    const dividendsData = dividendsRef.data();
    if(dividendsData?.usersClaimed?.includes(userRef.id))
      throw new HttpException('Dividends Already Claimed',HttpStatus.BAD_REQUEST);
    const transactionsRef = await this.firebaseService.getCollection("transactions-mangopay").where('user','==',userRef.id).where('project','==',claimDto.projectId).get();
    if(transactionsRef.empty)
      throw new HttpException('User cant claim',HttpStatus.BAD_REQUEST);
    const projectRef = await this.firebaseService.getCollection('investments').doc(claimDto.projectId).get();
    const projectData = projectRef.data();
    const amount = transactionsRef.docs.reduce((x:number,y:any)=>{      
      return x+= Number(y.data().amount)
    },0);
    const participation = amount/(dividendsData.totalAmount * 100);
    const interest = (dividendsData.interest) * participation
    const totalTransfer = !dividendsData.retention ? amount+interest : amount+(interest*(1-(transactionsRef.docs[0].data().retention)/100));
    const transfer = await this.mangopayService.transferFundsProjects(projectData.projectWallet,userWallet,totalTransfer);
    if(transfer.ResultCode != '000000')
      throw new HttpException(transfer.ResultMessage,HttpStatus.BAD_REQUEST);
    const now = Date.now();
    await this.firebaseService.getCollection('dividends-user').doc(`${now}`).set({
      user:userRef.id,
      amount: totalTransfer,
      project:projectRef.id
    })
    return await this.firebaseService.getCollection("dividends-mangopay").doc(dividendsRef.id).set({
      usersClaimed:firestore.FieldValue.arrayUnion(userRef.id)
    },{merge:true});
  }

  async createDividends(address: string, totalAmount:number, totalTransfer:number,interest:number, retention:boolean) {
  const investmentRef = await this.firebaseService.getCollection('investments').where('tokensAddress','==',address).get();
  if(investmentRef.empty)
    throw new HttpException('Investment doesnt exists', HttpStatus.NOT_FOUND);
  const investmentData = investmentRef.docs[0].data();
  const walletDividendsBalance = await this.mangopayService.getAccountBalance(this.DIVIDENDS_WALLET);
  if(walletDividendsBalance.Balance.Amount < (totalTransfer*100) )
    throw new HttpException('Not enought money in the account',HttpStatus.BAD_REQUEST);
  const transferStatus = await this.mangopayService.transferFundsProjects(this.DIVIDENDS_WALLET,investmentData.projectWallet,Math.round(totalTransfer*100))
  if(transferStatus.ResultCode != '000000')
    throw new HttpException(transferStatus.ResultMessage,HttpStatus.INTERNAL_SERVER_ERROR);
  return await this.firebaseService.getCollection('dividends-mangopay').doc(investmentRef.docs[0].id).set({
    interest:interest,
    retention:retention,
    totalAmount:totalAmount,
    usersClaimed:[]          
  })
  }

  async update(uid: string, _: UpdateProjectDto) {
    const investmentRef = await this.firebaseService.getCollection('investments').doc(uid).get();
    if(!investmentRef.exists)
      throw new HttpException('Investment Not Found', HttpStatus.NOT_FOUND);
    const investmentData = investmentRef.data();
    const wallet = await this.mangopayService.createMangopayWallet({Currency:'EUR',Description:investmentData.title || investmentData.company,Tag:uid,Owners:[this.MANGOPAY_PROJECTS_ID]});
    await this.firebaseService.getCollection('investments').doc(uid).set({projectWallet:wallet.Id},{merge:true})
    return wallet;
  }

  async investProjects(investDTO: InvestProjectDto) {
    const projectRef = await this.firebaseService.getCollection('investments').doc(investDTO.projectId).get();
    const userRef = await this.firebaseService.getCollection('users').doc(investDTO.userId).get();
    if(!userRef.exists || !projectRef.exists)
      throw new HttpException('User or Project not found',HttpStatus.NOT_FOUND);
    const userWalletRef = await this.firebaseService.getCollection('mangopay').doc(userRef.id).get();
    if(!userWalletRef.exists)
      throw new HttpException('User has not wallet',HttpStatus.BAD_REQUEST);
    const userWalletData = userWalletRef.data();
    const userData = userRef.data() as FirebasePersonResponse | FirebaseCompanyResponse;
    const country = 'particular' in userData ? userData.particular?.pais_de_residencia : userData.Empresa?.Representante?.pais_de_residencia
    const userRetention = Utils.getRetentionRate(country);
    const projectData = projectRef.data();
    const secretKeyData = (await this.firebaseService.getCollection('balance').doc(process.env.ADMIN_UID).get()).data();
    const secretKey = await this.blockchainService.decryptSecret(secretKeyData);
      let isExternal = true;
      Logger.log(userWalletData?.walletId,projectData.projectWallet, projectData.priceToken * investDTO.totalTokens)
      if(!investDTO.userWallet){
        const response = await firstValueFrom(await this.httpService.post(this.API_GENERATE_WALLET,{userUid:investDTO.userId},{  headers:{'Authorization': this.FIREBASE_API_CREDENTIALS }})) as any;
        investDTO.userWallet = response?.data?.address || response.address;
        isExternal = false;
        const isSigned = await this.blockchainService.getWalletStatus(investDTO.userWallet );
        if(isSigned != 1){
          await this.blockchainService.registerBlockchainWallet(secretKey,investDTO.userWallet );
        }
        // const investmentData = await this.firebaseService.getInvestmentBySellerAddress(investDTO.sellerAddress);
        await this.firebaseService.getCollection('users').doc(investDTO.userId).set({
          walletsWhitelist: firestore.FieldValue.arrayUnion(investDTO.userWallet),
          isInversor:true
        },{ merge:true});
      }
      const transfer= await this.mangopayService.transferFunds(userWalletData?.walletId,projectData.projectWallet, projectData.priceToken * investDTO.totalTokens);
      await this.blockchainService.mintTokenV2(secretKey,{sellerAddress:projectData.sellerAddress, tokenQuantity:investDTO.totalTokens, wallet:investDTO.userWallet},isExternal);
      await this.sendEmailNotification({
        displayName:userData.displayName,
        userEmail:userData.email,
        projectName: projectData.nameTokens,
        tokenQuantity: investDTO.totalTokens,
        amount: projectData.priceToken * investDTO.totalTokens,
        tokenAddress: projectData.tokensAddress,
        sellerAddress: projectData.sellerAddress,
      })
      await this.emailservice.sendMail({
          to:this.ADMIN_EMAIL,
          from:this.ADMIN_EMAIL,
          subject:`¡Minteo de tokens automaticos!`,
          text:`se ha realizado el minteo de ${investDTO.totalTokens} tokens del proyecto ${projectData.nameTokens} con direccion de token ${projectData.tokensAddress} al usuario ${userData.email} ${investDTO.userWallet}`})
        
    const pdf = await PDFDocument.load(this.PDF_DOCUMENT);
    const form = (pdf).getForm();
    const proyectoField = form.getTextField('proyecto');
    const inversorField = form.getTextField('nomre inversor');
    const emailField = form.getTextField('email');
    const duracionField = form.getTextField('duracion proyecto')
    const descriptionField = form.getTextField('descripcion proyecto');
    const euroField = form.getTextField('euros invertidos');
    const percentageField = form.getTextField('porcentaje de interes anual');
    const dateField = form.getTextField('fecha');
    proyectoField.setText(projectData.title)
    inversorField.setText('particular' in userData ? `${userData.particular.nombre+' '+userData.particular.apellido1}`:`${userData.Empresa.Representante.nombre+' '+userData.Empresa.Representante.apellido1}`)
    emailField.setText(userData.email)
    descriptionField.setText(projectData.description)
    euroField.setText(`${projectData.priceToken * investDTO.totalTokens} €`);
    percentageField.setText(`${projectData.annualReturn} %`);
    duracionField.setText(`${projectData.estimatedDeliveryTime}`);
    dateField.setText(`${new Date()}`)
    form.flatten()
    const pdfByte = await pdf.save()
    const pdfPath = path.join(process.cwd(),`./src/public/${userData.uid}.pdf`) 
    fs.writeFileSync(pdfPath,pdfByte);
    const now = `${Date.now()}`
    this.firebaseService.uploadPDFBucket(projectRef.id,userRef.id,now,pdfPath).then(async ()=>{

      this.firebaseService.getCollection('user-tx-documents').doc(userRef.id).set({
        uid:userRef.id,
        documents:firestore.FieldValue.arrayUnion({
          project:projectRef.id,
          filename:now
        })
      })
      console.log('Succesfully uploaded file')
      fs.unlinkSync(pdfPath);
    }).catch((e)=>{
      console.log(e.message);
    })
      const id = Date.now().toString()
        return await this.firebaseService.getCollection('transactions-mangopay').doc(id).set({transferID:transfer.Id,user:userData.uid, project: projectRef.id, quantity: investDTO.totalTokens, wallet:investDTO.userWallet, amount: projectData.priceToken * investDTO.totalTokens, retention: userRetention, timestamp:id });
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }

  async sendEmailNotification(paymentDetails:{displayName?:string,userEmail:string, projectName:string, tokenQuantity:number, amount:number, tokenAddress:string, sellerAddress:string}): Promise<void>{
    try {
      await this.emailservice.sendMail({
        to:this.ADMIN_EMAIL,
        from:this.ADMIN_EMAIL,
        subject:`¡Nueva inversión por Billetera digital!`,
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
          ${paymentDetails.userEmail}
          </li>
          <li>
            <strong>Proyecto:</strong> 
            ${paymentDetails.projectName}
          </li>
              <li>
                <strong>Tokens:</strong>
                 ${paymentDetails.tokenQuantity}
              </li>
              <li>
                <strong>Importe:</strong>
                 ${ paymentDetails.amount / 100 } €
              </li>
              <li>
                <strong>Direccion del Token:</strong>
                 ${ paymentDetails.tokenAddress }
              </li>
              <li>
                <strong>Direccion del Seller:</strong>
                 ${ paymentDetails.sellerAddress }
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
      await this.emailservice.sendMail({
        to: paymentDetails.userEmail,
        from: this.ADMIN_EMAIL,
        subject: `¡Inversión en ${paymentDetails.projectName} completada!`, 
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
      <div><strong style="float:left">Hola, ${paymentDetails.displayName ?? paymentDetails.userEmail}.</strong>
        <br>
        <p style="text-align: justify;">
            La transacción en el proyecto ${paymentDetails.projectName}  por valor de ${paymentDetails.amount / 100} € se ha procesado con éxito.
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
    catch (error) {
     console.log(error.message); 
    }
  }
}


