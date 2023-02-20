import _ from 'lodash';
import moment from 'moment';
import { getCsvContent } from './write-csv-utils';

const REJECTED_AUTOMATICALLY_COMMENT =
  "Le candidat a répondu faux à plus de 50% des questions posées, cela a invalidé l'ensemble de sa certification, et a donc entraîné un score de 0 pix";

async function getDivisionCertificationResultsCsv({ certificationResults }) {
  const data = _buildFileDataWithoutCertificationCenterName({ certificationResults });
  const fileHeaders = _buildFileHeadersWithoutCertificationCenterName();

  return getCsvContent({ data, fileHeaders });
}

async function getSessionCertificationResultsCsv({ session, certificationResults }) {
  const fileHeaders = _buildFileHeaders(certificationResults);
  const data = _buildFileData({ session, certificationResults });

  return getCsvContent({ data, fileHeaders });
}

async function getCleaCertifiedCandidateCsv(cleaCertifiedCandidates) {
  const fileHeaders = _buildFileHeadersForCleaCandidates(cleaCertifiedCandidates);
  const data = _buildFileDataForCleaCandidates(cleaCertifiedCandidates);

  return getCsvContent({ data, fileHeaders });
}

function _buildFileDataWithoutCertificationCenterName({ certificationResults }) {
  return certificationResults.map(_getRowItemsFromResults);
}

function _getRowItemsFromResults(certificationResult) {
  const rowWithoutCompetences = {
    [_headers.CERTIFICATION_NUMBER]: certificationResult.id,
    [_headers.FIRSTNAME]: certificationResult.firstName,
    [_headers.LASTNAME]: certificationResult.lastName,
    [_headers.BIRTHDATE]: _formatDate(certificationResult.birthdate),
    [_headers.BIRTHPLACE]: certificationResult.birthplace,
    [_headers.EXTERNAL_ID]: certificationResult.externalId,
    [_headers.STATUS]: _formatStatus(certificationResult),
    [_headers.PIX_SCORE]: _formatPixScore(certificationResult),
    [_headers.JURY_COMMENT_FOR_ORGANIZATION]: _getCommentForOrganization(certificationResult),
    [_headers.SESSION_ID]: certificationResult.sessionId,
    [_headers.CERTIFICATION_DATE]: _formatDate(certificationResult.createdAt),
  };
  const competencesRow = {};
  _competenceIndexes.forEach((competenceIndex) => {
    competencesRow[competenceIndex] = _getCompetenceLevel({
      competencesWithMark: certificationResult.competencesWithMark,
      competenceIndex,
      certificationResult,
    });
  });
  return { ...rowWithoutCompetences, ...competencesRow };
}

function _buildFileHeadersWithoutCertificationCenterName() {
  return _.concat(
    [
      _headers.CERTIFICATION_NUMBER,
      _headers.FIRSTNAME,
      _headers.LASTNAME,
      _headers.BIRTHDATE,
      _headers.BIRTHPLACE,
      _headers.EXTERNAL_ID,
      _headers.STATUS,
      _headers.PIX_SCORE,
    ],
    _competenceIndexes,
    [_headers.JURY_COMMENT_FOR_ORGANIZATION, _headers.SESSION_ID, _headers.CERTIFICATION_DATE]
  );
}

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

function _buildFileData({ session, certificationResults }) {
  const sessionComplementaryCertificationsLabels = _getComplementaryCertificationResultsLabels(certificationResults);
  return certificationResults.map(_getRowItemsFromSessionAndResults(session, sessionComplementaryCertificationsLabels));
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

function _getComplementaryCertificationResultsHeaders(certificationResults) {
  return [
    ...new Set(
      certificationResults.flatMap((certificationResult) =>
        certificationResult.getUniqComplementaryCertificationCourseResultHeaders()
      )
    ),
  ];
}

function _getComplementaryCertificationResultsLabels(certificationResults) {
  return [
    ...new Set(
      certificationResults.flatMap((certificationResult) =>
        certificationResult.getUniqComplementaryCertificationCourseResultLabels()
      )
    ),
  ];
}

function _buildFileHeaders(certificationResults) {
  const complementaryCertificationResultsHeaders = _getComplementaryCertificationResultsHeaders(certificationResults);

  return _.concat(
    [
      _headers.CERTIFICATION_NUMBER,
      _headers.FIRSTNAME,
      _headers.LASTNAME,
      _headers.BIRTHDATE,
      _headers.BIRTHPLACE,
      _headers.EXTERNAL_ID,
      _headers.STATUS,
    ],
    complementaryCertificationResultsHeaders,
    [_headers.PIX_SCORE],
    _competenceIndexes,
    [
      _headers.JURY_COMMENT_FOR_ORGANIZATION,
      _headers.SESSION_ID,
      _headers.CERTIFICATION_CENTER,
      _headers.CERTIFICATION_DATE,
    ]
  );
}

const _getRowItemsFromSessionAndResults =
  (session, sessionComplementaryCertificationsLabels) => (certificationResult) => {
    const complementaryCertificationsHeadersWithData = sessionComplementaryCertificationsLabels
      .map((sessionComplementaryCertificationsLabel) => ({
        [`Certification ${sessionComplementaryCertificationsLabel}`]:
          certificationResult.getComplementaryCertificationStatus(sessionComplementaryCertificationsLabel),
      }))
      .reduce((result, value) => {
        return Object.assign(result, value);
      }, {});
    const rowWithoutCompetences = {
      [_headers.CERTIFICATION_NUMBER]: certificationResult.id,
      [_headers.FIRSTNAME]: certificationResult.firstName,
      [_headers.LASTNAME]: certificationResult.lastName,
      [_headers.BIRTHDATE]: _formatDate(certificationResult.birthdate),
      [_headers.BIRTHPLACE]: certificationResult.birthplace,
      [_headers.EXTERNAL_ID]: certificationResult.externalId,
      [_headers.STATUS]: _formatStatus(certificationResult),
      ...complementaryCertificationsHeadersWithData,
      [_headers.PIX_SCORE]: _formatPixScore(certificationResult),
      [_headers.JURY_COMMENT_FOR_ORGANIZATION]: _getCommentForOrganization(certificationResult),
      [_headers.SESSION_ID]: session.id,
      [_headers.CERTIFICATION_CENTER]: session.certificationCenter,
      [_headers.CERTIFICATION_DATE]: _formatDate(certificationResult.createdAt),
    };

    const competencesCells = _getCompetenceCells(certificationResult);
    return { ...rowWithoutCompetences, ...competencesCells };
  };

function _formatPixScore(certificationResult) {
  if (certificationResult.isCancelled() || certificationResult.isInError()) return '-';
  if (certificationResult.isRejected()) return '0';
  return certificationResult.pixScore;
}

function _formatDate(date) {
  return moment(date).format('DD/MM/YYYY');
}

function _formatStatus(certificationResult) {
  if (certificationResult.isCancelled()) return 'Annulée';
  if (certificationResult.isValidated()) return 'Validée';
  if (certificationResult.isRejected()) return 'Rejetée';
  if (certificationResult.isInError()) return 'En erreur';
  if (certificationResult.isStarted()) return 'Démarrée';
}

function _getCompetenceCells(certificationResult) {
  const competencesRow = {};
  _competenceIndexes.forEach((competenceIndex) => {
    competencesRow[competenceIndex] = _getCompetenceLevel({
      competenceIndex,
      certificationResult,
    });
  });
  return competencesRow;
}

function _getCompetenceLevel({ certificationResult, competenceIndex }) {
  const competencesWithMark = certificationResult.competencesWithMark;
  const levelByCompetenceCode = _getLevelByCompetenceCode({ competencesWithMark });
  const competence = levelByCompetenceCode[competenceIndex];
  const notTestedCompetence = !competence;

  if (notTestedCompetence || certificationResult.isCancelled() || certificationResult.isInError()) {
    return '-';
  }
  if (certificationResult.isRejected() || _isCompetenceFailed(competence)) {
    return 0;
  }
  return competence.level;
}

function _getLevelByCompetenceCode({ competencesWithMark }) {
  return competencesWithMark.reduce((result, competence) => {
    const competenceCode = competence.competence_code;
    result[competenceCode] = { level: competence.level };
    return result;
  }, {});
}

function _isCompetenceFailed(competence) {
  return competence.level <= 0;
}

function _getCommentForOrganization(certificationResult) {
  if (certificationResult.hasBeenRejectedAutomatically()) return REJECTED_AUTOMATICALLY_COMMENT;

  return certificationResult.commentForOrganization;
}

function _getGenderCandidate(sex) {
  return sex === 'F' ? 'MME' : 'M';
}

function _getValueForBoolean(value) {
  return value ? 'OUI' : 'NON';
}

const _competenceIndexes = [
  '1.1',
  '1.2',
  '1.3',
  '2.1',
  '2.2',
  '2.3',
  '2.4',
  '3.1',
  '3.2',
  '3.3',
  '3.4',
  '4.1',
  '4.2',
  '4.3',
  '5.1',
  '5.2',
];

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

export default {
  getSessionCertificationResultsCsv,
  getDivisionCertificationResultsCsv,
  getCleaCertifiedCandidateCsv,
  REJECTED_AUTOMATICALLY_COMMENT,
};
