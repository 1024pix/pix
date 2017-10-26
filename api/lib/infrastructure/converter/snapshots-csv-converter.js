const moment = require('moment');
const _ = require('lodash');

const headersWithoutCompetences = ['"Nom"', '"Prenom"', '"Numero Etudiant"', '"Code Campagne"', '"Date"', '"Score Pix"', '"Tests Realises"'];

module.exports = {
  convertJsonToCsv(jsonData) {
    let textCsv = '';

    if(_emptyData(jsonData)) {
      return textCsv;
    }

    textCsv += _createHeaderLine(_fromStringOrJsonToJson(jsonData[0].profile));
    textCsv += jsonData.map(_createProfileLine).join('');

    return textCsv;
  }
};

function _createHeaderLine(jsonProfil) {
  let textCsvLineHeaders = headersWithoutCompetences.join(';');

  textCsvLineHeaders += ';';

  const listCompetences = _cleanArrayCompetences(jsonProfil.included);

  textCsvLineHeaders += listCompetences.map(_.property('name')).join(';');

  textCsvLineHeaders += '\n';
  return textCsvLineHeaders;
}

function _createProfileLine(snapshot) {
  let snapshotCsvLine = '';
  const listCompetences = _cleanArrayCompetences(_fromStringOrJsonToJson(snapshot.profile).included);
  const numberRealisedTest = listCompetences.filter((competence) => competence.level >=0).length;

  snapshotCsvLine += [`"${snapshot.user.lastName}"`,
    `"${snapshot.user.firstName}"`,
    `"${snapshot.studentCode || ''}"`,
    `"${snapshot.campaignCode || ''}"`,
    moment(snapshot.createdAt).format('DD/MM/YYYY'),
    snapshot.score || '']
    .join(';');

  snapshotCsvLine += ';';

  // XXX We add '=' before string to force Excel to read it as string, not as date
  snapshotCsvLine += `="${numberRealisedTest}/${listCompetences.length}";`;

  snapshotCsvLine += _(listCompetences).map((comp) => comp.level < 0 ? '' : comp.level).join(';');

  snapshotCsvLine += '\n';
  return snapshotCsvLine;
}

function _cleanArrayCompetences(arrayCompetences) {
  return _.sortBy(arrayCompetences, 'attributes.index')
    .filter(competence => competence.type === 'competences')
    .map(competence => {
      return {
        name: `"${_cleanCompetenceName(competence.attributes.name)}"`,
        index: competence.attributes.index,
        level: competence.attributes.level
      };
    });
}

function _emptyData(jsonData) {
  return !jsonData[0];
}

function _cleanCompetenceName(name) {
  return name
    .replace(/é/g,'e')
    .replace(/é/g,'e')
    .replace(/ê/g,'e');
}

function _fromStringOrJsonToJson(data) {
  if(typeof data === 'string') {
    return JSON.parse(data);
  } else {
    return data;
  }
}
