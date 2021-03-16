const { getCsvContent } = require('./write-csv-utils');
const { status: assessmentResultStatuses } = require('../../../domain/models/AssessmentResult');
const _ = require('lodash');
const moment = require('moment');

async function getDivisionCertificationResultsCsv({
  certificationResults,
}) {
  const data = _buildCertificationResultsFileDataWithoutCertificationCenterName({ certificationResults });
  const fileHeaders = _buildCertificationResultsFileHeadersWithoutCertificationCenterName();

  return getCsvContent({ data, fileHeaders });
}

async function getSessionCertificationResultsCsv({
  session,
  certificationResults,
}) {
  const data = _buildCertificationResultsFileDataWithCertificationCenterName({ session, certificationResults });
  const fileHeaders = _buildCertificationResultsFileHeadersWithCertificationCenterName();

  return getCsvContent({ data, fileHeaders });
}

async function getSessionCertificationResultsCsvWithCleaStatus({
  session,
  certificationResults,
}) {
  const data = _buildCertificationResultsFileDataWithCertificationCenterNameAndCleaStatus({ session, certificationResults });
  const fileHeaders = _buildCertificationResultsFileHeadersWithCertificationCenterNameAndCleaStatus();

  return getCsvContent({ data, fileHeaders });
}

function _buildCertificationResultsFileDataWithoutCertificationCenterName({ certificationResults }) {
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
    [_headers.PIX_SCORE]: _formatPixScore(certificationResult),
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

function _buildCertificationResultsFileHeadersWithoutCertificationCenterName() {
  return _.concat(
    [
      _headers.CERTIFICATION_NUMBER,
      _headers.FIRSTNAME,
      _headers.LASTNAME,
      _headers.BIRTHDATE,
      _headers.BIRTHPLACE,
      _headers.EXTERNAL_ID,
      _headers.PIX_SCORE,
    ],
    _competenceIndexes,
    [
      _headers.SESSION_ID,
      _headers.CERTIFICATION_DATE,
    ],
  );
}

function _buildCertificationResultsFileDataWithCertificationCenterNameAndCleaStatus({ session, certificationResults }) {
  return certificationResults.map(_getRowItemsFromSessionAndResultsWithCleaStatus(session));
}

function _buildCertificationResultsFileDataWithCertificationCenterName({ session, certificationResults }) {
  return certificationResults.map(_getRowItemsFromSessionAndResults(session));
}

function _buildCertificationResultsFileHeadersWithCertificationCenterName() {
  return _.concat(
    [
      _headers.CERTIFICATION_NUMBER,
      _headers.FIRSTNAME,
      _headers.LASTNAME,
      _headers.BIRTHDATE,
      _headers.BIRTHPLACE,
      _headers.EXTERNAL_ID,
      _headers.PIX_SCORE,
    ],
    _competenceIndexes,
    [
      _headers.SESSION_ID,
      _headers.CERTIFICATION_CENTER,
      _headers.CERTIFICATION_DATE,
    ],
  );
}

function _buildCertificationResultsFileHeadersWithCertificationCenterNameAndCleaStatus() {
  return _.concat(
    [
      _headers.CERTIFICATION_NUMBER,
      _headers.FIRSTNAME,
      _headers.LASTNAME,
      _headers.BIRTHDATE,
      _headers.BIRTHPLACE,
      _headers.EXTERNAL_ID,
      _headers.CLEA_STATUS,
      _headers.PIX_SCORE,
    ],
    _competenceIndexes,
    [
      _headers.SESSION_ID,
      _headers.CERTIFICATION_CENTER,
      _headers.CERTIFICATION_DATE,
    ],
  );
}

const _getRowItemsFromSessionAndResults = (session) => (certificationResult) => {
  const rowWithoutCompetences = {
    [_headers.CERTIFICATION_NUMBER]: certificationResult.id,
    [_headers.FIRSTNAME]: certificationResult.firstName,
    [_headers.LASTNAME]: certificationResult.lastName,
    [_headers.BIRTHDATE]: _formatDate(certificationResult.birthdate),
    [_headers.BIRTHPLACE]: certificationResult.birthplace,
    [_headers.EXTERNAL_ID]: certificationResult.externalId,
    [_headers.PIX_SCORE]: _formatPixScore(certificationResult),
    [_headers.SESSION_ID]: session.id,
    [_headers.CERTIFICATION_CENTER]: session.certificationCenter,
    [_headers.CERTIFICATION_DATE]: _formatDate(certificationResult.createdAt),
  };

  const competencesCells = _getCompetenceCells(certificationResult);
  return { ...rowWithoutCompetences, ...competencesCells };
};

const _getRowItemsFromSessionAndResultsWithCleaStatus = (session) => (certificationResult) => {
  const rowWithoutCompetences = {
    [_headers.CERTIFICATION_NUMBER]: certificationResult.id,
    [_headers.FIRSTNAME]: certificationResult.firstName,
    [_headers.LASTNAME]: certificationResult.lastName,
    [_headers.BIRTHDATE]: _formatDate(certificationResult.birthdate),
    [_headers.BIRTHPLACE]: certificationResult.birthplace,
    [_headers.EXTERNAL_ID]: certificationResult.externalId,
    [_headers.CLEA_STATUS]: certificationResult.cleaCertificationStatus,
    [_headers.PIX_SCORE]: _formatPixScore(certificationResult),
    [_headers.SESSION_ID]: session.id,
    [_headers.CERTIFICATION_CENTER]: session.certificationCenter,
    [_headers.CERTIFICATION_DATE]: _formatDate(certificationResult.createdAt),
  };

  const competencesCells = _getCompetenceCells(certificationResult);
  return { ...rowWithoutCompetences, ...competencesCells };
}

function _formatPixScore(certificationResult) {
  return _isCertificationRejected(certificationResult) ? '0' : certificationResult.pixScore;
}

function _isCertificationRejected(certificationResult) {
  return certificationResult.status === assessmentResultStatuses.REJECTED;
}

function _formatDate(date) {
  return moment(date).format('DD/MM/YYYY');
}

function _getCompetenceCells(certificationResult) {
  const competencesRow = {};
  _competenceIndexes.forEach((competenceIndex) => {
    competencesRow[competenceIndex] = _getCompetenceLevel({
      competencesWithMark: certificationResult.competencesWithMark,
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

  let competenceLevel = '';
  if (notTestedCompetence) {
    competenceLevel = '-';
  } else if (_isCertificationRejected(certificationResult) || _isCompetenceFailed(competence)) {
    competenceLevel = 0;
  } else {
    competenceLevel = competence.level;
  }

  return competenceLevel;
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

const _competenceIndexes = [
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3',
  '5.1', '5.2',
];

const _headers = {
  CERTIFICATION_NUMBER: 'Numéro de certification',
  FIRSTNAME: 'Prénom',
  LASTNAME: 'Nom',
  BIRTHDATE: 'Date de naissance',
  BIRTHPLACE: 'Lieu de naissance',
  EXTERNAL_ID: 'Identifiant Externe',
  CLEA_STATUS: 'Certification CléA numérique',
  PIX_SCORE: 'Nombre de Pix',
  SESSION_ID: 'Session',
  CERTIFICATION_CENTER: 'Centre de certification',
  CERTIFICATION_DATE: 'Date de passage de la certification',
};

module.exports = {
  getSessionCertificationResultsCsv,
  getSessionCertificationResultsCsvWithCleaStatus,
  getDivisionCertificationResultsCsv,
};
