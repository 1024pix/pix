import dayjs from 'dayjs';

import { getCsvContent } from '../../../../../../../lib/infrastructure/utils/csv/write-csv-utils.js';

const getCleaCertifiedCandidateCsv = async function ({ cleaCertifiedCandidates }) {
  const fileHeaders = _buildFileHeadersForCleaCandidates(cleaCertifiedCandidates);
  const data = _buildFileDataForCleaCandidates(cleaCertifiedCandidates);

  return getCsvContent({ data, fileHeaders });
};

function _buildFileHeadersForCleaCandidates() {
  return [
    _headers.SIREN,
    _headers.SIRET,
    _headers.REGISTRATION_STATUS,
    _headers.LEVEL,
    _headers.ORIGIN,
    _headers.FUNDER,
    _headers.GENDER,
    _headers.BIRTHNAME,
    _headers.USUAL_NAME,
    _headers.FIRSTNAME,
    _headers.EMAIL,
    _headers.PHONE,
    _headers.ADDRESS,
    _headers.ADDITIONAL_ADDRESS,
    _headers.CITY,
    _headers.POSTAL_CODE,
    _headers.BIRTHDATE,
    _headers.FOREIGN_BORN,
    _headers.GEOGRAPHIC_AREA,
    _headers.OUTERMOST_BORN,
    _headers.BIRTH_CITY,
    _headers.BIRTH_POSTAL_CODE,
    _headers.PASSING_DATE,
    _headers.CCPI,
    _headers.STATUS,
    _headers.FIRST_SHOT,
  ];
}

function _buildFileDataForCleaCandidates(cleaCertifiedCandidates) {
  return cleaCertifiedCandidates.map((candidate) => {
    return {
      [_headers.SIREN]: null,
      [_headers.SIRET]: null,
      [_headers.REGISTRATION_STATUS]: null,
      [_headers.LEVEL]: null,
      [_headers.ORIGIN]: null,
      [_headers.FUNDER]: null,
      [_headers.GENDER]: _getGenderCandidate(candidate.sex),
      [_headers.BIRTHNAME]: candidate.lastName,
      [_headers.USUAL_NAME]: null,
      [_headers.FIRSTNAME]: candidate.firstName,
      [_headers.EMAIL]: candidate.resultRecipientEmail,
      [_headers.PHONE]: null,
      [_headers.ADDRESS]: null,
      [_headers.ADDITIONAL_ADDRESS]: null,
      [_headers.CITY]: null,
      [_headers.POSTAL_CODE]: null,
      [_headers.BIRTHDATE]: _formatDate(candidate.birthdate),
      [_headers.FOREIGN_BORN]: _getValueForBoolean(candidate.isBornInAForeignCountry),
      [_headers.GEOGRAPHIC_AREA]: candidate.geographicAreaOfBirthCode,
      [_headers.OUTERMOST_BORN]: _getValueForBoolean(candidate.isBornInFrenchOutermostRegion),
      [_headers.BIRTH_CITY]: candidate.birthplace,
      [_headers.BIRTH_POSTAL_CODE]: candidate.birthPostalCode,
      [_headers.PASSING_DATE]: _formatDate(candidate.createdAt),
      [_headers.CCPI]: 'CléA Numérique by Pix',
      [_headers.STATUS]: 'CERTIFIE',
      [_headers.FIRST_SHOT]: null,
    };
  });
}

function _formatDate(date) {
  return dayjs(date).format('DD/MM/YYYY');
}

function _getGenderCandidate(sex) {
  return sex === 'F' ? 'MME' : 'M';
}

function _getValueForBoolean(value) {
  return value ? 'OUI' : 'NON';
}

const _headers = {
  CERTIFICATION_NUMBER: 'Numéro de certification',
  FIRSTNAME: 'Prénom',
  LASTNAME: 'Nom',
  BIRTHDATE: 'Date de naissance',
  BIRTHPLACE: 'Lieu de naissance',
  EXTERNAL_ID: 'Identifiant Externe',
  STATUS: 'Statut',
  PIX_SCORE: 'Nombre de Pix',
  SESSION_ID: 'Session',
  CERTIFICATION_CENTER: 'Centre de certification',
  CERTIFICATION_DATE: 'Date de passage de la certification',
  JURY_COMMENT_FOR_ORGANIZATION: 'Commentaire jury pour l’organisation',
  SIREN: "SIREN de l'organisme",
  SIRET: "Siret de l'établissement",
  REGISTRATION_STATUS: "Statut à l'inscription",
  LEVEL: "Niveau d'instruction",
  ORIGIN: 'Origine de la démarche',
  FUNDER: 'Financeur',
  GENDER: 'Civilité',
  BIRTHNAME: 'Nom de naissance',
  USUAL_NAME: "Nom d'usage",
  EMAIL: 'Email',
  PHONE: 'Téléphone',
  ADDRESS: 'Adresse',
  ADDITIONAL_ADDRESS: "Complément d'adresse",
  CITY: 'Ville',
  POSTAL_CODE: 'Code postal',
  FOREIGN_BORN: "Né à l'étranger",
  GEOGRAPHIC_AREA: 'Zone géographique de naissance',
  OUTERMOST_BORN: "Né en collectivité d'outre-mer",
  BIRTH_CITY: 'Ville de naissance',
  BIRTH_POSTAL_CODE: 'Code postal de naissance',
  PASSING_DATE: 'Date de passage',
  CCPI: 'CCPI',
  FIRST_SHOT: 'Obtention après la première évaluation ?',
};

export { getCleaCertifiedCandidateCsv };
