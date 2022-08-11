const _ = require('lodash');
const moment = require('moment');
const { getCsvContent } = require('./write-csv-utils');

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

function _buildFileData({ session, certificationResults }) {
  const sessionComplementaryCertificationsLabels = getComplementaryCertificationResultsLabels(certificationResults);
  return certificationResults.map(_getRowItemsFromSessionAndResults(session, sessionComplementaryCertificationsLabels));
}

function getComplementaryCertificationResultsHeaders(certificationResults) {
  return [
    ...new Set(
      certificationResults.flatMap((certificationResult) =>
        certificationResult.getUniqComplementaryCertificationCourseResultHeaders()
      )
    ),
  ];
}

function getComplementaryCertificationResultsLabels(certificationResults) {
  return [
    ...new Set(
      certificationResults.flatMap((certificationResult) =>
        certificationResult.getUniqComplementaryCertificationCourseResultLabels()
      )
    ),
  ];
}

function _buildFileHeaders(certificationResults) {
  const complementaryCertificationResultsHeaders = getComplementaryCertificationResultsHeaders(certificationResults);

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
      .map((sessionComplementaryCertificationsLabel) => {
        let status = 'Non passée';
        if (certificationResult.isCancelled()) {
          return { [`Certification ${sessionComplementaryCertificationsLabel}`]: 'Annulée' };
        }
        const complementaryCertificationCourseResult = certificationResult.complementaryCertificationCourseResults.find(
          ({ label }) => label === sessionComplementaryCertificationsLabel
        );
        if (complementaryCertificationCourseResult) {
          status = complementaryCertificationCourseResult.acquired ? 'Validée' : 'Rejetée';
        }
        return { [`Certification ${sessionComplementaryCertificationsLabel}`]: status };
      })
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
  CLEA_STATUS: 'Certification CléA Numérique',
  PIX_PLUS_DROIT_MAITRE_STATUS: 'Certification Pix+ Droit Maître',
  PIX_PLUS_DROIT_EXPERT_STATUS: 'Certification Pix+ Droit Expert',
  PIX_PLUS_EDU_2ND_DEGRE_INITIE_HEADER: 'Certification Pix+ Édu 2nd degré Initié (entrée dans le métier)',
  PIX_PLUS_EDU_2ND_DEGRE_CONFIRME_HEADER: 'Certification Pix+ Édu 2nd degré Confirmé',
  PIX_PLUS_EDU_2ND_DEGRE_AVANCE_HEADER: 'Certification Pix+ Édu 2nd degré Avancé',
  PIX_PLUS_EDU_2ND_DEGRE_EXPERT_HEADER: 'Certification Pix+ Édu 2nd degré Expert',
  PIX_PLUS_EDU_1ER_DEGRE_INITIE_HEADER: 'Certification Pix+ Édu 1er degré Initié (entrée dans le métier)',
  PIX_PLUS_EDU_1ER_DEGRE_CONFIRME_HEADER: 'Certification Pix+ Édu 1er degré Confirmé',
  PIX_PLUS_EDU_1ER_DEGRE_AVANCE_HEADER: 'Certification Pix+ Édu 1er degré Avancé',
  PIX_PLUS_EDU_1ER_DEGRE_EXPERT_HEADER: 'Certification Pix+ Édu 1er degré Expert',
  PIX_SCORE: 'Nombre de Pix',
  SESSION_ID: 'Session',
  CERTIFICATION_CENTER: 'Centre de certification',
  CERTIFICATION_DATE: 'Date de passage de la certification',
  JURY_COMMENT_FOR_ORGANIZATION: 'Commentaire jury pour l’organisation',
};

module.exports = {
  getSessionCertificationResultsCsv,
  getDivisionCertificationResultsCsv,
  REJECTED_AUTOMATICALLY_COMMENT,
};
