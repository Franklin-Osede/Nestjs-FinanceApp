import {address, CountryISO, user} from "mangopay2-nodejs-sdk";
import { FirebasePersonResponse } from "src/firebase/interfaces/firebase.userresponse.interface";
import {Utils} from '../../utils/utils'
export class UserMangoPay {
    PersonType: "NATURAL";
    FirstName: string;
    LastName: string;
    Address:address.AddressData;
    Birthday: number;
    Nationality: CountryISO;
    CountryOfResidence: CountryISO;
    Occupation: string;
    IncomeRange?: user.IncomeRange;
    ProofOfIdentity?: string;
    ProofOfAddress?: string;
    Capacity: "NORMAL" | "DECLARATIVE";
    Email: string;
    KYCLevel: user.KYCLevel;
    TermsAndConditionsAccepted?: boolean;
    UserCategory?: user.UserCategory;
    Id?: string;
    Tag: string;
    CreationDate: number;

    constructor(data:FirebasePersonResponse){
        this.Address = {
            AddressLine1: data.particular.domicilio,
            AddressLine2: '',
            City: data.particular.ciudad,
            PostalCode: data.particular.codigo_postal,
            Country: Utils.getIsoCountry(data.particular.pais_de_residencia) as CountryISO,
            Region: Utils.getIsoCountry(data.particular.pais_de_residencia) as CountryISO
        }
        this.FirstName = data.particular.nombre;
        this.LastName = data.particular.apellido1;
        const date = data.particular?.fecha_de_nacimiento.split('-') || ['01','01','1990']
        this.Birthday = new Date(Number(date[0]),Number(date[2]),Number(date[1])).getTime()/1000;
        this.Nationality = Utils.getIsoCountry(data.particular.nacionalidad) as CountryISO;
        this.CountryOfResidence = Utils.getIsoCountry(data.particular.pais_de_residencia) as CountryISO;
        this.KYCLevel = 'LIGHT';
        this.Occupation = data.fininfo.profesion;
        this.Capacity = 'NORMAL';
        this.Email = data.email;
        this.PersonType = 'NATURAL';
        this.UserCategory = 'PAYER';
        this.TermsAndConditionsAccepted = true;
        this.Tag = data.uid;
        this.Id = data.uid;
    }

}