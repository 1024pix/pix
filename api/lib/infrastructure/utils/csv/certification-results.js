const { getCsvContent } = require('./write-csv-utils');
const { status: assessmentResultStatuses } = require('../../../domain/models/AssessmentResult');
const _ = require('lodash');
const moment = require('moment');

const competenceIndexes = [
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3',
  '5.1', '5.2',
];

function _getLevelByCompetenceCode({ competencesWithMark }) {
  return competencesWithMark.reduce((result, competence) => {
    const competenceCode = competence.competence_code;
    result[competenceCode] = { level: competence.level };
    return result;
  }, {});
}

function _competenceIsFailedOrCertifRejected(competence, isCertifRejected) { return isCertifRejected || competence.level <= 0; }

function _getCompetenceLevel({ competencesWithMark, competenceIndex, isCertifRejected }) {
  const levelByCompetenceCode = _getLevelByCompetenceCode({ competencesWithMark });
  const competence = levelByCompetenceCode[competenceIndex];
  const notTestedCompetence = !competence;

  let competenceLevel = '';
  if (notTestedCompetence) {
    competenceLevel = '-';
  } else if (_competenceIsFailedOrCertifRejected(competence, isCertifRejected)) {
    competenceLevel = 0;
  } else {
    competenceLevel = competence.level;
  }

  return competenceLevel;
}
const headers = {
  CERTIFICATION_NUMBER: 'Numéro de certification',
  FIRSTNAME: 'Prénom',
  LASTNAME: 'Nom',
  BIRTHDATE: 'Date de naissance',
  BIRTHPLACE: 'Lieu de naissance',
  EXTERNAL_ID: 'Identifiant Externe',
  PIX_SCORE: 'Nombre de Pix',
  SESSION_ID: 'Session',
  CERTIFICATION_CENTER: 'Centre de certification',
  CERTIFICATION_DATE: 'Date de passage de la certification',

};

function formatDate(date) {
  return moment(date).format('DD/MM/YYYY');
}

function _buildCertificationResultsFileData({ session, certificationResults }) {
  return certificationResults.map((certifResult) => {
    const isCertifRejected = certifResult.status === assessmentResultStatuses.REJECTED;
    const rowItem = {
      [headers.CERTIFICATION_NUMBER]: certifResult.id,
      [headers.FIRSTNAME]: certifResult.firstName,
      [headers.LASTNAME]: certifResult.lastName,
      [headers.BIRTHDATE]: formatDate(certifResult.birthdate),
      [headers.BIRTHPLACE]: certifResult.birthplace,
      [headers.EXTERNAL_ID]: certifResult.externalId,
      [headers.PIX_SCORE]: isCertifRejected ? '0' : certifResult.pixScore,
      [headers.SESSION_ID]: session.id,
      [headers.CERTIFICATION_CENTER]: session.certificationCenter,
      [headers.CERTIFICATION_DATE]: formatDate(certifResult.createdAt),
    };

    competenceIndexes.forEach((competenceIndex) => {
      rowItem[competenceIndex] = _getCompetenceLevel({
        competencesWithMark: certifResult.competencesWithMark,
        competenceIndex,
        isCertifRejected,
      });
    });

    return rowItem;
  });
}

function _buildCertificationResultsFileHeaders() {
  return _.concat(
    [
      headers.CERTIFICATION_NUMBER,
      headers.FIRSTNAME,
      headers.LASTNAME,
      headers.BIRTHDATE,
      headers.BIRTHPLACE,
      headers.EXTERNAL_ID,
      headers.PIX_SCORE,
    ],
    competenceIndexes,
    [
      headers.SESSION_ID,
      headers.CERTIFICATION_CENTER,
      headers.CERTIFICATION_DATE,
    ],
  );
}

async function getCertificationResultsCsv({
  session,
  certificationResults,
}) {
  const data = _buildCertificationResultsFileData({ session, certificationResults });
  const fileHeaders = _buildCertificationResultsFileHeaders();

  return getCsvContent({ data, fileHeaders });
}

module.exports = {
  getCertificationResultsCsv,
};
