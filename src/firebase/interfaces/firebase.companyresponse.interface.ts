export interface FirebaseCompanyResponse {
    bankAccount: string;
    uid:              string;
    Empresa:          Empresa;
    kyc:              Kyc;
    displayName:      string;
    email:            string;
    disclaimer:       Disclaimer;
    isInversor:       boolean;
    walletsWhitelist: string[];
    hideBlockchain:   boolean;
}

export interface Empresa {
    Inversor_Pro:  InversorPro;
    Datos_Empresa: DatosEmpresa;
    Representante: { [key: string]: null | string };
    Titulares:     { [key: string]: null | string }[];
}

export interface DatosEmpresa {
    CIF:                      string;
    Empresa:                  string;
    Escritura_de_la_sociedad: string;
    otrosdoc:                 string;
    Forma_juridica:           string;
    Acta_de_la_empresa:       string;
    Razon_Social:             string;
    Nombre_de_la_empresa:     string;
}

export interface InversorPro {
    Recursos_sociedad_sup_2M:  null;
    cliente_profesional:       null;
    Negocios_sociedad_mas_40M: null;
    inversor_pro:              string;
    Activos_mas_de_20M:        null;
}

export interface Disclaimer {
    terminos_y_condiciones_de_uso: boolean;
    politica_de_privacidad:        boolean;
    datos_veraces:                 boolean;
}

export interface Kyc {
    result: number;
}