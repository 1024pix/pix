const _ = require('lodash');
const moment = require('moment');
const { getCsvContent } = require('./write-csv-utils');
const { status: assessmentResultStatuses } = require('../../../domain/models/AssessmentResult');
const { status: certificationResultStatuses } = require('../../../domain/models/CertificationResult');
const { cleaStatuses } = require('../../../domain/models/CleaCertificationResult');
const { statuses: maitreStatuses } = require('../../../domain/models/PixPlusDroitMaitreCertificationResult');
const { statuses: expertStatuses } = require('../../../domain/models/PixPlusDroitExpertCertificationResult');

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
  const fileHeaders = _buildFileHeaders(certificationResults);
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
    [_headers.STATUS]: _formatStatus(certificationResult.status),
    [_headers.PIX_SCORE]: _formatPixScore(certificationResult),
    [_headers.JURY_COMMENT_FOR_ORGANIZATION]: certificationResult.commentForOrganization,
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
    [
      _headers.JURY_COMMENT_FOR_ORGANIZATION,
      _headers.SESSION_ID,
      _headers.CERTIFICATION_DATE,
    ],
  );
}

function _buildFileData({ session, certificationResults }) {
  return certificationResults.map(_getRowItemsFromSessionAndResults(session));
}

function _buildFileHeaders(certificationResults) {
  const shouldIncludeCleaHeader = certificationResults.some((certificationResult) => certificationResult.hasTakenClea());
  const shouldIncludePixPlusDroitMaitreHeader = certificationResults.some((certificationResult) => certificationResult.hasTakenPixPlusDroitMaitre());
  const shouldIncludePixPlusDroitExpertHeader = certificationResults.some((certificationResult) => certificationResult.hasTakenPixPlusDroitExpert());

  const cleaHeader = shouldIncludeCleaHeader
    ? [_headers.CLEA_STATUS]
    : [];
  const pixPlusDroitMaitreHeader = shouldIncludePixPlusDroitMaitreHeader
    ? [_headers.PIX_PLUS_DROIT_MAITRE_STATUS]
    : [];
  const pixPlusDroitExpertHeader = shouldIncludePixPlusDroitExpertHeader
    ? [_headers.PIX_PLUS_DROIT_EXPERT_STATUS]
    : [];

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
    pixPlusDroitMaitreHeader,
    pixPlusDroitExpertHeader,
    cleaHeader,
    [ _headers.PIX_SCORE ],
    _competenceIndexes,
    [
      _headers.JURY_COMMENT_FOR_ORGANIZATION,
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
    [_headers.STATUS]: _formatStatus(certificationResult.status),
    [_headers.CLEA_STATUS]: _formatCleaCertificationResult(certificationResult.cleaCertificationResult),
    [_headers.PIX_PLUS_DROIT_MAITRE_STATUS]: _formatPixPlusDroitMaitreCertificationResult(certificationResult.pixPlusDroitMaitreCertificationResult),
    [_headers.PIX_PLUS_DROIT_EXPERT_STATUS]: _formatPixPlusDroitExpertCertificationResult(certificationResult.pixPlusDroitExpertCertificationResult),
    [_headers.PIX_SCORE]: _formatPixScore(certificationResult),
    [_headers.JURY_COMMENT_FOR_ORGANIZATION]: certificationResult.commentForOrganization,
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

function _formatPixPlusDroitMaitreCertificationResult(pixPlusDroitMaitreCertificationResult) {
  if (pixPlusDroitMaitreCertificationResult.status === maitreStatuses.ACQUIRED) return 'Validée';
  if (pixPlusDroitMaitreCertificationResult.status === maitreStatuses.REJECTED) return 'Rejetée';
  return 'Non passée';
}

function _formatPixPlusDroitExpertCertificationResult(pixPlusDroitExpertCertificationResult) {
  if (pixPlusDroitExpertCertificationResult.status === expertStatuses.ACQUIRED) return 'Validée';
  if (pixPlusDroitExpertCertificationResult.status === expertStatuses.REJECTED) return 'Rejetée';
  return 'Non passée';
}

function _formatPixScore(certificationResult) {
  if (certificationResult.status === certificationResultStatuses.CANCELLED) return '-';
  if (_isCertificationRejected(certificationResult)) return '0';
  return certificationResult.pixScore;
}

function _isCertificationRejected(certificationResult) {
  return certificationResult.status === assessmentResultStatuses.REJECTED;
}

function _formatDate(date) {
  return moment(date).format('DD/MM/YYYY');
}

function _formatStatus(status) {
  switch (status) {
    case certificationResultStatuses.CANCELLED: return 'Annulée';
    case certificationResultStatuses.VALIDATED: return 'Validée';
    case certificationResultStatuses.REJECTED: return 'Rejetée';
    case certificationResultStatuses.ERROR: return 'En erreur';
    case certificationResultStatuses.STARTED: return 'Démarrée';
  }
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

  if (notTestedCompetence || certificationResult.status === certificationResultStatuses.CANCELLED) {
    return '-';
  }
  if (_isCertificationRejected(certificationResult) || _isCompetenceFailed(competence)) {
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
  STATUS: 'Statut',
  CLEA_STATUS: 'Certification CléA numérique',
  PIX_PLUS_DROIT_MAITRE_STATUS: 'Certification Pix+ Droit Maître',
  PIX_PLUS_DROIT_EXPERT_STATUS: 'Certification Pix+ Droit Expert',
  PIX_SCORE: 'Nombre de Pix',
  SESSION_ID: 'Session',
  CERTIFICATION_CENTER: 'Centre de certification',
  CERTIFICATION_DATE: 'Date de passage de la certification',
  JURY_COMMENT_FOR_ORGANIZATION: 'Commentaire jury pour l’organisation',
};

module.exports = {
  getSessionCertificationResultsCsv,
  getDivisionCertificationResultsCsv,
};
