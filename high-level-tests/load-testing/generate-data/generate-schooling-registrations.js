const js2xmlparser = require('js2xmlparser');
const faker = require('faker');
const fs = require('fs');
require('dotenv').config();

const run = function() {

  const DEFAULT_USER_COUNT = 5;
  const userCount = process.env.SCHOOLING_REGISTRATION_USER_COUNT || process.argv[2] || DEFAULT_USER_COUNT;

  const DEFAULT_ORGANIZATION_UAJ = '1237457A';
  const organizationUAJ =  process.env.SCHOOLING_REGISTRATION_UAJ || process.argv[3] || DEFAULT_ORGANIZATION_UAJ;

  const DEFAULT_FILE_NAME = `SIECLE-organization-${organizationUAJ}-${userCount}-users.xml`;
  const fileName =  process.env.SCHOOLING_REGISTRATION_FILE_NAME || DEFAULT_FILE_NAME;

  generate({ userCount, organizationUAJ, fileName });

};

const generate = function({ userCount, organizationUAJ, fileName }) {

  console.log(`Generating ${fileName} file on organization ${organizationUAJ} for ${userCount} users`);

  const PARAMETRES = {
    UAJ: organizationUAJ,
    ANNEE_SCOLAIRE: '2019',
    DATE_EXPORT: '29/08/2019',
    HORODATAGE: '29/08/2019 15:25:08',
  };

  const ELEVES = generateELEVES(userCount);

  const STRUCTURES = generateSTRUCTURES(ELEVES);

  const DONNEES = {
    ELEVES: { ELEVE: ELEVES } ,
    OPTIONS: {},
    STRUCTURES: { STRUCTURES_ELEVE : STRUCTURES },
    BOURSES: {},
    ADRESSES: {},
  };

  const BEE_ELEVES = {
    PARAMETRES,
    DONNEES,
  };

  const rootXMLNode = 'BEE_ELEVES';
  const SIECLEFileContent = js2xmlparser.parse(rootXMLNode, BEE_ELEVES);

  fs.writeFileSync(fileName , SIECLEFileContent);

  console.log('Successfully generated');

};

const generateELEVES = function(userCount) {

  const ELEVES = [];

  const identifier = function(base, length) {
    const padWith = '0';
    return base.toString().padStart(length, padWith);
  };

  for (let i = 0; i < userCount; i++) {

    const ELEVE = {
      '@': {
        ELEVE_ID: identifier(i,7), // 7  '1223189',
        ELENOET:  identifier(i,4),    //  4 '6202'
      },
      ID_NATIONAL: identifier(i,12), // 12: '123456789AB',
      INE_BEA:     identifier(i,11), // 11: '1234567890A',
      INE_RNIE:    identifier(i,12), //  12:'123456789AB',
      ELENOET:     identifier(i,4), // See @
      ID_ELEVE_ETAB: identifier(i,11), // '12345678901'
      NOM_DE_FAMILLE: faker.name.lastName(),
      PRENOM:  faker.name.firstName(),
      PRENOM2: faker.name.firstName(),
      PRENOM3: faker.name.firstName(),
      DATE_NAISS: '01/03/2001',
      DOUBLEMENT: '1',
      CODE_PAYS: '100',
      ACCEPTE_SMS: '0',
      DATE_MODIFICATION: '27/08/2019',
      CODE_REGIME: '0',
      DATE_ENTREE: '01/09/2015',
      VILLE_NAISS: '',
      CODE_SEXE: '2',
      CODE_PAYS_NAT: '100',
      CODE_STATUT: 'ST',
      CODE_MEF: identifier(i,11), // 11 '12345678901',
      CODE_DEPARTEMENT_NAISS: '041',
      CODE_COMMUNE_INSEE_NAISS: '41018',
      ADHESION_TRANSPORT: '0',
      CODE_PROVENANCE: '1',
      SCOLARITE_AN_DERNIER: {
        CODE_MEF: identifier(i,11), //11 '12345678901',
        CODE_STRUCTURE: '3E 4',
        CODE_RNE: '0180777X',
        CODE_NATURE: '340',
        SIGLE: 'CLG',
        DENOM_PRINC: 'COLLEGE',
        DENOM_COMPL: 'JEAN RENOIR',
        LIGNE1_ADRESSE: '40 rue des Fileuses',
        BOITE_POSTALE: '',
        MEL: 'ce.0180777X@ac-orleans-tours.fr',
        TELEPHONE: '0248202445',
        CODE_COMMUNE_INSEE: '18033',
        LL_COMMUNE_INSEE: 'BOURGES',
      },
    };

    ELEVES.push(ELEVE);
  }

  return ELEVES;
};

const generateSTRUCTURES = function(ELEVES) {

  const STRUCTURES = [];

  ELEVES.forEach((eleve) => {

    const STRUCTURES_ELEVE = {
      '@': {
        ELEVE_ID: eleve['@'].ELEVE_ID,
        ELENOET: eleve['@'].ELENOET,
      },
      STRUCTURE: {
        CODE_STRUCTURE: '3E 2',
        TYPE_STRUCTURE: 'D',
      },
    };

    STRUCTURES.push(STRUCTURES_ELEVE);

  });

  return STRUCTURES;
};

run();
