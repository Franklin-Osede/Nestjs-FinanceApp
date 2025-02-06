import { IsNotEmpty, IsEmail } from "class-validator"
export class NotificationsDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    document: string;

    @IsNotEmpty()
    @IsEmail()
    originalEmail: string;
}
