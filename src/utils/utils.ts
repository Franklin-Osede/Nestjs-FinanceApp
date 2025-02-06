const countriesApproved = {
    "Afganistán": "AF",
    "Albania": "AL",
    "Alemania": "DE",
    "Andorra": "AD",
    "Angola": "AO",
    "Antigua y Barbuda": "AG",
    "Arabia Saudita": "SA",
    "Argelia": "DZ",
    "Argentina": "AR",
    "Armenia": "AM",
    "Australia": "AU",
    "Austria": "AT",
    "Azerbaiyán": "AZ",
    "Bahamas": "BS",
    "Bangladés": "BD",
    "Barbados": "BB",
    "Baréin": "BH",
    "Bélgica": "BE",
    "Belice": "BZ",
    "Benín": "BJ",
    "Bielorrusia": "BY",
    "Birmania": "MM",
    "Bolivia": "BO",
    "Bosnia y Herzegovina": "BA",
    "Botsuana": "BW",
    "Brasil": "BR",
    "Brunéi": "BN",
    "Bulgaria": "BG",
    "Burkina Faso": "BF",
    "Burundi": "BI",
    "Bután": "BT",
    "Cabo Verde": "CV",
    "Camboya": "KH",
    "Camerún": "CM",
    "Canadá": "CA",
    "Catar": "QA",
    "Chad": "TD",
    "Chile": "CL",
    "China": "CN",
    "Chipre": "CY",
    "Colombia": "CO",
    "Comoras": "KM",
    "Congo": "CG",
    "Corea del Norte": "KP",
    "Corea del Sur": "KR",
    "Costa de Marfil": "CI",
    "Costa Rica": "CR",
    "Croacia": "HR",
    "Cuba": "CU",
    "Dinamarca": "DK",
    "Dominica": "DM",
    "Ecuador": "EC",
    "Egipto": "EG",
    "El Salvador": "SV",
    "Emiratos Árabes Unidos": "AE",
    "Eritrea": "ER",
    "Eslovaquia": "SK",
    "Eslovenia": "SI",
    "España": "ES",
    "Estados Unidos": "US",
    "Estonia": "EE",
    "Etiopía": "ET",
    "Filipinas": "PH",
    "Finlandia": "FI",
    "Fiyi": "FJ",
    "Francia": "FR",
    "Gabón": "GA",
    "Gambia": "GM",
    "Georgia": "GE",
    "Ghana": "GH",
    "Granada": "GD",
    "Grecia": "GR",
    "Guatemala": "GT",
    "Guinea": "GN",
    "Guinea-Bisáu": "GW",
    "Guinea Ecuatorial": "GQ",
    "Guyana": "GY",
    "Haití": "HT",
    "Honduras": "HN",
    "Hungría": "HU",
    "India": "IN",
    "Indonesia": "ID",
    "Irak": "IQ",
    "Irán": "IR",
    "Irlanda": "IE",
    "Islandia": "IS",
    "Islas Marshall": "MH",
    "Islas Salomón": "SB",
    "Israel": "IL",
    "Italia": "IT",
    "Jamaica": "JM",
    "Japón": "JP",
    "Jordania": "JO",
    "Kazajistán": "KZ",
    "Kenia": "KE",
    "Kirguistán": "KG",
    "Kiribati": "KI",
    "Kuwait": "KW",
    "Laos": "LA",
    "Lesoto": "LS",
    "Letonia": "LV",
    "Líbano": "LB",
    "Liberia": "LR",
    "Libia": "LY",
    "Liechtenstein": "LI",
    "Lituania": "LT",
    "Luxemburgo": "LU",
    "Macedonia del Norte": "MK",
    "Madagascar": "MG",
    "Malasia": "MY",
    "Malaui": "MW",
    "Maldivas": "MV",
    "Malí": "ML",
    "Malta": "MT",
    "Marruecos": "MA",
    "Mauricio": "MU",
    "Mauritania": "MR",
    "México": "MX",
    "Micronesia": "FM",
    "Moldavia": "MD",
    "Mónaco": "MC",
    "Mongolia": "MN",
    "Montenegro": "ME",
    "Mozambique": "MZ",
    "Namibia": "NA",
    "Nauru": "NR",
    "Nepal": "NP",
    "Nicaragua": "NI",
    "Níger": "NE",
    "Nigeria": "NG",
    "Noruega": "NO",
    "Nueva Zelanda": "NZ",
    "Omán": "OM",
    "Países Bajos": "NL",
    "Pakistán": "PK",
    "Palaos": "PW",
    "Panamá": "PA",
    "Papúa Nueva Guinea": "PG",
    "Paraguay": "PY",
    "Perú": "PE",
    "Polonia": "PL",
    "Portugal": "PT",
    "Reino Unido": "GB",
    "República Centroafricana": "CF",
    "República Checa": "CZ",
    "República Democrática del Congo": "CD",
    "República Dominicana": "DO",
    "Ruanda": "RW",
    "Rumanía": "RO",
    "Rusia": "RU",
    "Samoa": "WS",
    "San Cristóbal y Nieves": "KN",
    "San Marino": "SM",
    "San Vicente y las Granadinas": "VC",
    "Santa Lucía": "LC",
    "Santo Tomé y Príncipe": "ST",
    "Senegal": "SN",
    "Serbia": "RS",
    "Seychelles": "SC",
    "Sierra Leona": "SL",
    "Singapur": "SG",
    "Siria": "SY",
    "Somalia": "SO",
    "Sri Lanka": "LK",
    "Suazilandia": "SZ",
    "Sudáfrica": "ZA",
    "Sudán": "SD",
    "Sudán del Sur": "SS",
    "Suecia": "SE",
    "Suiza": "CH",
    "Surinam": "SR",
    "Tailandia": "TH",
    "Tanzania": "TZ",
    "Tayikistán": "TJ",
    "Timor Oriental": "TL",
    "Togo": "TG",
    "Tonga": "TO",
    "Trinidad y Tobago": "TT",
    "Túnez": "TN",
    "Turkmenistán": "TM",
    "Turquía": "TR",
    "Tuvalu": "TV",
    "Ucrania": "UA",
    "Uganda": "UG",
    "Uruguay": "UY",
    "Uzbekistán": "UZ",
    "Vanuatu": "VU",
    "Venezuela": "VE",
    "Vietnam": "VN",
    "Yemen": "YE",
    "Yibuti": "DJ",
    "Zambia": "ZM",
    "Zimbabue": "ZW"
}; 

const retentionsByCountry = {
    "Albania": 6,
    "Alemania": 0,
    "Andorra": 5,
    "Arabia Saudita": 5,
    "Argelia": 5,
    "Argentina": 12,
    "Armenia": 5,
    "Australia": 5,
    "Austria": 5,
    "Autralia": 10,
    "Barbados": 0,
    "Bielorusia": 0,
    "Bolivia": 15,
    "Bosnia Herzegovina": 7,
    "Brasil": 15,
    "Bulgaria": 0,
    "Bélgica": 10,
    "Canada": 10,
    "Chile": 15,
    "China": 10,
    "Chipre": 0,
    "Colombia": 10,
    "Corea": 10,
    "Costarrica": 5,
    "Croacia": 0,
    "Cuba": 10,
    "Ecuador": 10,
    "Egipto": 10,
    "El Salvador": 10,
    "Emiratos Árabes Unidos": 0,
    "Eslovaquia": 0,
    "Eslovenia": 5,
    "España": 19,
    "Estados Unidos de América": 10,
    "Estonia": 0,
    "Federacion Rusa": 5,
    "Filipinas": 15,
    "Finlandia": 10,
    "Francia": 10,
    "Georgia": 0,
    "Grecia": 8,
    "Honk Kong": 5,
    "Hungria": 0,
    "India": 15,
    "Indonesia": 10,
    "Iran": 7.5,
    "Irlanda": 0,
    "Israel": 10,
    "Italia": 12,
    "Jamaica": 10,
    "Japon": 10,
    "Kazajstan": 10,
    "Kirguizistán": 0,
    "Kuwait": 0,
    "Letonia": 10,
    "Lituania": 10,
    "Luxemburgo": 10,
    "Macedonia": 5,
    "Malasia": 10,
    "Malta": 0,
    "Marruecos": 10,
    "Moldavia": 5,
    "México": 10,
    "Nigeria": 7.5,
    "Noruega": 10,
    "Nueva Zelanda": 10,
    "Oman": 5,
    "Paises Bajos": 10,
    "Pakistan": 10,
    "Panama": 5,
    "Polonia": 0,
    "Portugal": 15,
    "Reino Unido": 0,
    "Republica Dominicana": 10,
    "República Checa": 0,
    "Rumania": 10,
    "Rusia": 5,
    "Senegal": 10,
    "Servia": 10,
    "Singapur": 5,
    "Sudafrica": 5,
    "Suecia": 15,
    "Suiza": 0,
    "Tailandia": 15,
    "Tayikistán": 0,
    "Trinidad y Tobago": 8,
    "Tunez": 10,
    "Turkmenistán": 0,
    "Turquia": 15,
    "Ucrania": 0,
    "Uruguay": 10,
    "Uzbekistan": 5,
    "Venezuela": 0,
    "Vietnam": 10
  }  

export class Utils {
    static getIsoCountry(country:string): string | null {
        return countriesApproved[country] || null;
    }

    static getRetentionRate(country: string): number {
        console.log(retentionsByCountry[country]);
        console.log(country)
        return isNaN(retentionsByCountry[country]) ? 19 : retentionsByCountry[country] ;
    }
}
