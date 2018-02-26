const moment = require('moment');
const { sortBy } = require('lodash');

function _getHeaderForIdentificationCode(organization) {
  switch (organization.type) {
    case 'SUP':
      return 'Numéro Étudiant';
    case 'SCO':
      return 'Numéro INE';
    case 'PRO':
    default:
      return 'ID-Pix';
  }
}

function _createHeadersLine(organization, competences) {
  const identificationCodeHeader = _getHeaderForIdentificationCode(organization);
  const headers = [
    '"Nom"',
    '"Prénom"',
    `"${identificationCodeHeader}"`,
    '"Code Campagne"',
    '"Date"',
    '"Score Pix"',
    '"Tests Réalisés"'
  ];

  competences.forEach(competence => {
    headers.push(`"${competence.name}"`);
  });
  return headers.join(';') + '\n';
}

function _fromStringOrJsonToJson(data) {
  if (typeof data === 'string') {
    return JSON.parse(data);
  } else {
    return data;
  }
}

function _getSnapshotCompetenceLevelsSortedByCompetenceIndex(snapshot) {
  const jsonapiProfile = _fromStringOrJsonToJson(snapshot.profile);
  const competences = jsonapiProfile.included.filter((item) => item.type === 'competences');
  const competenceLevels = competences.map(competence => {
    return {
      index: competence.attributes.index,
      level: competence.attributes.level
    };
  });
  return sortBy(competenceLevels, ['index']);
}

function _createProfileLine(snapshot) {
  const snapshotCompetenceLevels = _getSnapshotCompetenceLevelsSortedByCompetenceIndex(snapshot);

  let snapshotCsvLine = '';

  snapshotCsvLine += [
    `"${snapshot.user.lastName}"`,
    `"${snapshot.user.firstName}"`,
    `"${snapshot.studentCode || ''}"`,
    `"${snapshot.campaignCode || ''}"`,
    moment(snapshot.createdAt).format('DD/MM/YYYY'),
    snapshot.score || ''
  ].join(';');

  snapshotCsvLine += ';';

  // XXX We add '=' before string to force Excel to read it as string, not as date
  snapshotCsvLine += `="${snapshot.testsFinished}/${snapshotCompetenceLevels.length}";`;

  snapshotCsvLine += snapshotCompetenceLevels.map(competenceLevel =>  competenceLevel.level < 0 ? '' : competenceLevel.level).join(';');

  return snapshotCsvLine + '\n';
}

function _createProfileLines(jsonSnapshots) {
  return jsonSnapshots.map(_createProfileLine).join('');
}

module.exports = {

  convertJsonToCsv(organization, competences, jsonSnapshots) {
    // XXX: add the UTF-8 BOM at the start of the text; see https://stackoverflow.com/a/38192870
    let textCsv = '\uFEFF';
    textCsv += _createHeadersLine(organization, competences);
    textCsv += _createProfileLines(jsonSnapshots);
    return textCsv;
  }

};

