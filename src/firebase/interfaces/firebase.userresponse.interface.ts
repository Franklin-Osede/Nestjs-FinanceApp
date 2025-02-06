export interface FirebasePersonResponse {
    bankAccount: string;
    emailVerified:    undefined | null | boolean;
    photoURL:         string | null;
    uid:              string;
    walletsWhitelist: undefined | null | string[];
    kyc:              Kyc;
    displayName:      string | null;
    particular:       Particular;
    email:            string;
    disclaimer:       Disclaimer;
    fininfo:          Fininfo;
}

export interface Disclaimer {
    terminos_y_condiciones_de_uso: boolean;
    politica_de_privacidad:        boolean;
    datos_veraces:                 boolean;
}

export interface Fininfo {
    oper_job:                   null;
    ingreso_anual:              string;
    fuente_ingresos:            string;
    knoledgement_securtoken:    string;
    lastoper:                   null;
    origen_fondos:              string;
    estudios:                   string;
    inversor_pro:               string;
    negative_support:           string;
    sup500k:                    null;
    gestion_de_empresas_sector: string;
    target_invest_patri:        string;
    time:                       string;
    knoledgement_quiebra:       string;
    profesion:                  string;
    target_invest:              string;
}

export interface Kyc {
    livenessResult:              null;
    endTimeUtc:                  Date;
    reviewerId:                  null;
    customerAddressCheck:        null;
    qrCodeRedirect:              boolean;
    technicalData:               TechnicalData;
    faceMatchingConfidence:      null;
    faceMatchingResult:          null;
    language:                    string;
    videoIdentificationType:     number;
    id:                          string;
    frontImageCapture2:          null;
    customerAddress:             string;
    customerAddressResult:       null;
    deviceType:                  string;
    additionalInformation:       AdditionalInformation;
    documentTypeCapture2:        null;
    recordVideo:                 boolean;
    documentVerificationId2:     null;
    reviewChecks:                null;
    formData:                    null;
    doReview:                    boolean;
    createdUtc:                  Date;
    status:                      number;
    faceRecordId:                null;
    frontImage:                  null;
    documentType:                number;
    video:                       null;
    faceImage:                   null;
    performDocumentVerification: boolean;
    duration:                    string;
    result:                      number;
    reviewerComments:            null;
    reviewerName:                null;
    browser:                     string;
    externalIdentifier:          null;
    auditEvents:                 null;
    performLivenessDetection:    boolean;
    documentIdentification:      string;
    userId:                      number;
    customerAddressDocument:     null;
    backImage:                   null;
    backImageCapture2:           null;
    deviceModel:                 string;
    videoResolution:             string;
    performAddressCheck:         boolean;
    startTimeUtc:                Date;
    documentVerificationId:      string;
    username:                    string;
}

export interface AdditionalInformation {
    endTimeUtc:           Date;
    livenessEndTimeUtc:   null;
    frontCapture2TimeUtc: null;
    livenessStartTimeUtc: null;
    faceCaptureTimeUtc:   Date;
    frontCaptureTimeUtc:  Date;
    backCapture2TimeUtc:  null;
    backCaptureTimeUtc:   Date;
    startTimeUtc:         Date;
}

export interface TechnicalData {
    date:         Date;
    country:      string;
    zipCode:      string;
    screenWidth:  number;
    city:         string;
    timezone:     number;
    ip:           string;
    isp:          string;
    latitude:     number;
    screenHeight: number;
    language:     string;
    dateUTC:      Date;
    countryCode:  string;
    browser:      string;
    company:      string;
    longitude:    number;
    status:       string;
}

export interface Particular {
    apellido2:               string;
    codigo_postal:           string;
    funcion_publica:         string;
    apellido1:               string;
    pais_de_residencia:      string;
    documentIdentification:  string;
    nombre:                  string;
    nacionalidad:            string;
    domicilio:               string;
    trabaja_funcion_publica: string;
    ciudad:                  string;
    fecha_de_nacimiento:     string;
    vive_en_usa:             string;
    telefono:                null;
}