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

function _sortCompetenceMarkByCompetenceIndex({ competencesWithMark }) {
  return competencesWithMark.reduce((result, competence) => {
    const competenceCode = competence.competence_code;
    result[competenceCode] = { index: competenceCode, level: competence.level };
    return result;
  }, {});
}

function _getCompetenceLevel({ competencesWithMark, competenceIndex, isCertifRejected }) {
  const certificationIndexedCompetences = _sortCompetenceMarkByCompetenceIndex({ competencesWithMark });
  const competence = certificationIndexedCompetences[competenceIndex];

  const _competenceIsFailedOrCertifRejected =
    (competence) => competence.level === 0 || competence.level === -1 || isCertifRejected;

  let competenceLevel = '';
  if (!competence) {
    competenceLevel = '-';
  } else if (_competenceIsFailedOrCertifRejected(competence)) {
    competenceLevel = 0;
  } else {
    competenceLevel = competence.level;
  }

  return competenceLevel;
}

function _buildCertificationResultsFileData({ session, certificationResults }) {
  return certificationResults.map((certifSummary) => {
    const isCertifRejected = certifSummary.status === assessmentResultStatuses.REJECTED;
    const rowItem = {
      'Numéro de certification': certifSummary.id,
      'Prénom': certifSummary.firstName,
      'Nom': certifSummary.lastName,
      'Date de naissance': moment(certifSummary.birthdate).format('DD/MM/YYYY'),
      'Lieu de naissance': certifSummary.birthplace,
      'Identifiant Externe': certifSummary.externalId,
      'Nombre de Pix': isCertifRejected ? '0' : certifSummary.pixScore,
      'Session': session.id,
      'Centre de certification': session.certificationCenter,
      'Date de passage de la certification': moment(certifSummary.createdAt).format('DD/MM/YYYY'),
    };

    competenceIndexes.forEach((competenceIndex) => {
      rowItem[competenceIndex] = _getCompetenceLevel({
        competencesWithMark: certifSummary.competencesWithMark,
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
      'Numéro de certification',
      'Prénom',
      'Nom',
      'Date de naissance',
      'Lieu de naissance',
      'Identifiant Externe',
      'Nombre de Pix',
    ],
    competenceIndexes,
    [
      'Session',
      'Centre de certification',
      'Date de passage de la certification',
    ],
  );
}

async function getCertificationResultsfCsv({
  session,
  certificationResults,
}) {
  const data = _buildCertificationResultsFileData({ session, certificationResults });
  const fileHeaders = _buildCertificationResultsFileHeaders();

  return getCsvContent({ data, fileHeaders });
}

module.exports = {
  getCertificationResultsfCsv,
};
