const _ = require('lodash');
const moment = require('moment');
const { getCsvContent } = require('./write-csv-utils');

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
    [_headers.JURY_COMMENT_FOR_ORGANIZATION, _headers.SESSION_ID, _headers.CERTIFICATION_DATE]
  );
}

function _buildFileData({ session, certificationResults }) {
  return certificationResults.map(_getRowItemsFromSessionAndResults(session));
}

function _buildFileHeaders(certificationResults) {
  const shouldIncludeCleaHeader = certificationResults.some((certificationResult) =>
    certificationResult.hasTakenClea()
  );
  const shouldIncludePixPlusDroitMaitreHeader = certificationResults.some((certificationResult) =>
    certificationResult.hasTakenPixPlusDroitMaitre()
  );
  const shouldIncludePixPlusDroitExpertHeader = certificationResults.some((certificationResult) =>
    certificationResult.hasTakenPixPlusDroitExpert()
  );
  const shouldIncludePixPlusEduAutonomeHeader = certificationResults.some((certificationResult) =>
    certificationResult.hasTakenPixPlusEduAutonome()
  );
  const shouldIncludePixPlusEduAvanceHeader = certificationResults.some((certificationResult) =>
    certificationResult.hasTakenPixPlusEduAvance()
  );
  const shouldIncludePixPlusEduExpertHeader = certificationResults.some((certificationResult) =>
    certificationResult.hasTakenPixPlusEduExpert()
  );
  const shouldIncludePixPlusEduFormateurHeader = certificationResults.some((certificationResult) =>
    certificationResult.hasTakenPixPlusEduFormateur()
  );

  const cleaHeader = shouldIncludeCleaHeader ? [_headers.CLEA_STATUS] : [];
  const pixPlusDroitMaitreHeader = shouldIncludePixPlusDroitMaitreHeader ? [_headers.PIX_PLUS_DROIT_MAITRE_STATUS] : [];
  const pixPlusDroitExpertHeader = shouldIncludePixPlusDroitExpertHeader ? [_headers.PIX_PLUS_DROIT_EXPERT_STATUS] : [];
  const pixPlusEduAutonomeHeader = shouldIncludePixPlusEduAutonomeHeader ? [_headers.PIX_PLUS_EDU_AUTONOME_HEADER] : [];
  const pixPlusEduAvanceHeader = shouldIncludePixPlusEduAvanceHeader ? [_headers.PIX_PLUS_EDU_AVANCE_HEADER] : [];
  const pixPlusEduExpertHeader = shouldIncludePixPlusEduExpertHeader ? [_headers.PIX_PLUS_EDU_EXPERT_HEADER] : [];
  const pixPlusEduFormateurHeader = shouldIncludePixPlusEduFormateurHeader
    ? [_headers.PIX_PLUS_EDU_FORMATEUR_HEADER]
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
    pixPlusEduAutonomeHeader,
    pixPlusEduAvanceHeader,
    pixPlusEduExpertHeader,
    pixPlusEduFormateurHeader,
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

const _getRowItemsFromSessionAndResults = (session) => (certificationResult) => {
  const rowWithoutCompetences = {
    [_headers.CERTIFICATION_NUMBER]: certificationResult.id,
    [_headers.FIRSTNAME]: certificationResult.firstName,
    [_headers.LASTNAME]: certificationResult.lastName,
    [_headers.BIRTHDATE]: _formatDate(certificationResult.birthdate),
    [_headers.BIRTHPLACE]: certificationResult.birthplace,
    [_headers.EXTERNAL_ID]: certificationResult.externalId,
    [_headers.STATUS]: _formatStatus(certificationResult),
    [_headers.CLEA_STATUS]: _formatCleaCertificationResult(certificationResult),
    [_headers.PIX_PLUS_DROIT_MAITRE_STATUS]: _formatPixPlusDroitMaitreCertificationResult(certificationResult),
    [_headers.PIX_PLUS_DROIT_EXPERT_STATUS]: _formatPixPlusDroitExpertCertificationResult(certificationResult),
    [_headers.PIX_PLUS_EDU_AUTONOME_HEADER]: _formatPixPlusEduAutonomeCertificationResult(certificationResult),
    [_headers.PIX_PLUS_EDU_AVANCE_HEADER]: _formatPixPlusEduAvanceCertificationResult(certificationResult),
    [_headers.PIX_PLUS_EDU_EXPERT_HEADER]: _formatPixPlusEduExpertCertificationResult(certificationResult),
    [_headers.PIX_PLUS_EDU_FORMATEUR_HEADER]: _formatPixPlusEduFormateurCertificationResult(certificationResult),
    [_headers.PIX_SCORE]: _formatPixScore(certificationResult),
    [_headers.JURY_COMMENT_FOR_ORGANIZATION]: certificationResult.commentForOrganization,
    [_headers.SESSION_ID]: session.id,
    [_headers.CERTIFICATION_CENTER]: session.certificationCenter,
    [_headers.CERTIFICATION_DATE]: _formatDate(certificationResult.createdAt),
  };

  const competencesCells = _getCompetenceCells(certificationResult);
  return { ...rowWithoutCompetences, ...competencesCells };
};

function _formatCleaCertificationResult(certificationResult) {
  if (!certificationResult.hasTakenClea()) return 'Non passée';
  if (certificationResult.isCancelled()) return 'Annulée';
  return certificationResult.hasAcquiredClea() ? 'Validée' : 'Rejetée';
}

function _formatPixPlusDroitMaitreCertificationResult(certificationResult) {
  if (!certificationResult.hasTakenPixPlusDroitMaitre()) return 'Non passée';
  if (certificationResult.isCancelled()) return 'Annulée';
  return certificationResult.hasAcquiredPixPlusDroitMaitre() ? 'Validée' : 'Rejetée';
}

function _formatPixPlusDroitExpertCertificationResult(certificationResult) {
  if (!certificationResult.hasTakenPixPlusDroitExpert()) return 'Non passée';
  if (certificationResult.isCancelled()) return 'Annulée';
  return certificationResult.hasAcquiredPixPlusDroitExpert() ? 'Validée' : 'Rejetée';
}

function _formatPixPlusEduAutonomeCertificationResult(certificationResult) {
  if (!certificationResult.hasTakenPixPlusEduAutonome()) return 'Non passée';
  if (certificationResult.isCancelled()) return 'Annulée';
  return certificationResult.hasAcquiredPixPlusEduAutonome() ? 'Validée' : 'Rejetée';
}
function _formatPixPlusEduAvanceCertificationResult(certificationResult) {
  if (!certificationResult.hasTakenPixPlusEduAvance()) return 'Non passée';
  if (certificationResult.isCancelled()) return 'Annulée';
  return certificationResult.hasAcquiredPixPlusEduAvance() ? 'Validée' : 'Rejetée';
}
function _formatPixPlusEduExpertCertificationResult(certificationResult) {
  if (!certificationResult.hasTakenPixPlusEduExpert()) return 'Non passée';
  if (certificationResult.isCancelled()) return 'Annulée';
  return certificationResult.hasAcquiredPixPlusEduExpert() ? 'Validée' : 'Rejetée';
}
function _formatPixPlusEduFormateurCertificationResult(certificationResult) {
  if (!certificationResult.hasTakenPixPlusEduFormateur()) return 'Non passée';
  if (certificationResult.isCancelled()) return 'Annulée';
  return certificationResult.hasAcquiredPixPlusEduFormateur() ? 'Validée' : 'Rejetée';
}

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
  CLEA_STATUS: 'Certification CléA numérique',
  PIX_PLUS_DROIT_MAITRE_STATUS: 'Certification Pix+ Droit Maître',
  PIX_PLUS_DROIT_EXPERT_STATUS: 'Certification Pix+ Droit Expert',
  PIX_PLUS_EDU_AUTONOME_HEADER: 'Certification Pix+ Édu Autonome',
  PIX_PLUS_EDU_AVANCE_HEADER: 'Certification Pix+ Édu Avancé',
  PIX_PLUS_EDU_EXPERT_HEADER: 'Certification Pix+ Édu Expert',
  PIX_PLUS_EDU_FORMATEUR_HEADER: 'Certification Pix+ Édu Formateur',
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
