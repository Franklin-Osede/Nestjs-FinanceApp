import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NotificationsDto } from './dto/notifications.dto';
import { FirebaseService } from 'src/firebase/firebase';
import  { randomUUID } from 'node:crypto'

@Injectable()
export class NotificationsService {

     private readonly ADMIN_EMAIL:string = process.env.ADMIN_EMAIL || 'inversiones@domoblock.io'
    constructor( private readonly emailservice: MailerService, private readonly firebaseService: FirebaseService){}

    sendDuplicateEmailNotification(notificationDto:NotificationsDto){
        this.emailservice.sendMail({
            to: 'inversiones@domoblock.io',
            subject: 'DNI Duplicado',
            text: `Se ha registrado el usuario con email ${notificationDto.email}, utilizando el documento de identificacion: ${notificationDto.document}, documento ya utilizado por el usuario ${notificationDto.originalEmail} en la plataforma.`
        }).then(() => console.log('Email sent successfully')).catch(err => console.error('Failed to send email', err));
    }

    async createOTP(email:string) {
        const userRef = await this.firebaseService.getCollection('users').where('email','==',email).get();
        if (userRef.empty)
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const user =  userRef.docs[0].data();
        const uid = userRef.docs[0].id;
        const otpRef = await this.firebaseService.getCollection('OTP').doc(uid).get();
        if(otpRef.exists){
            const otpData = otpRef.data();
            if(otpData.timestamp < Date.now()) {
                const otp = await this.generateOTP(uid);
               return await this.emailservice.sendMail({
                    from: this.ADMIN_EMAIL,
                    to:user.email,
                    subject: 'Recuperación de contraseña',
                    text: `El código de recuperación de contraseña es: ${otp}`
                })
            }
            else{
               return  await this.emailservice.sendMail({
                    from: this.ADMIN_EMAIL,
                    to:user.email,
                    subject: 'Recuperación de contraseña',
                    text: `El código de recuperación de contraseña es: ${otpData.otp}`
                })
            }
        }
        const otp = await this.generateOTP(uid);
        return await this.emailservice.sendMail({
            from: this.ADMIN_EMAIL,
            to:user.email,
            subject: 'Recuperación de contraseña',
            text: `El código de recuperación de contraseña es: ${otp}`
        })
      }

      private async generateOTP(uid:string){
        const otp = randomUUID().replace('-','').slice(0,7).toUpperCase();
        await this.firebaseService.getCollection('OTP').doc(uid).set({
            otp:otp,
            timestamp: Date.now() + 600000 // 10 minutes
        })
        return otp;
      }
}
