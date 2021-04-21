const _ = require('lodash');
const moment = require('moment');
const { getCsvContent } = require('./write-csv-utils');
const { status: assessmentResultStatuses } = require('../../../domain/models/AssessmentResult');
const { cleaStatuses } = require('../../../domain/models/CleaCertificationResult');

async function getDivisionCertificationResultsCsv({
  certificationResults,
}) {
  const data = _buildFileDataWithoutCertificationCenterName({ certificationResults });
  const fileHeaders = _buildFileHeadersWithoutCertificationCenterName();

  return getCsvContent({ data, fileHeaders });
}

async function getSessionCertificationResultsCsv({
  session,
  certificationResults,
}) {
  const shouldIncludeCleaHeader = certificationResults.some((certificationResult) => certificationResult.hasTakenClea());
  const fileHeaders = _buildFileHeaders({ shouldIncludeCleaHeader });
  const data = _buildFileData({ session, certificationResults });

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

function _buildFileHeadersWithoutCertificationCenterName() {
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

function _buildFileData({ session, certificationResults }) {
  return certificationResults.map(_getRowItemsFromSessionAndResults(session));
}

function _buildFileHeaders({ shouldIncludeCleaHeader }) {

  const cleaHeader = shouldIncludeCleaHeader
    ? [_headers.CLEA_STATUS]
    : [];

  return _.concat(
    [
      _headers.CERTIFICATION_NUMBER,
      _headers.FIRSTNAME,
      _headers.LASTNAME,
      _headers.BIRTHDATE,
      _headers.BIRTHPLACE,
      _headers.EXTERNAL_ID,
    ],
    cleaHeader,
    [ _headers.PIX_SCORE ],
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
    [_headers.CLEA_STATUS]: _formatCleaCertificationResult(certificationResult.cleaCertificationResult),
    [_headers.PIX_SCORE]: _formatPixScore(certificationResult),
    [_headers.SESSION_ID]: session.id,
    [_headers.CERTIFICATION_CENTER]: session.certificationCenter,
    [_headers.CERTIFICATION_DATE]: _formatDate(certificationResult.createdAt),
  };

  const competencesCells = _getCompetenceCells(certificationResult);
  return { ...rowWithoutCompetences, ...competencesCells };
};

function _formatCleaCertificationResult(cleaCertificationResult) {
  if (cleaCertificationResult.status === cleaStatuses.ACQUIRED) return 'Validée';
  if (cleaCertificationResult.status === cleaStatuses.REJECTED) return 'Rejetée';
  return 'Non passée';
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
  getDivisionCertificationResultsCsv,
};
