const _ = require('lodash');
const airtable = require('../../airtable');

const tableName = 'Acquis';

const usedFields = [
  'Nom',
  'Indice',
  'Statut de l\'indice',
  'Comprendre',
  'En savoir plus',
  'PixValue',
  'Compétence (via Tube)',
  'Status',
];

const ACTIVATED_STATUS = ['actif'];

function fromAirTableObject(airtableSkillObject) {
  return {
    id: airtableSkillObject.getId(),
    name: airtableSkillObject.get('Nom'),
    hint: airtableSkillObject.get('Indice'),
    hintStatus: airtableSkillObject.get('Statut de l\'indice') || 'no status',
    tutorialIds: airtableSkillObject.get('Comprendre') || [],
    learningMoreTutorialIds: airtableSkillObject.get('En savoir plus') || [],
    pixValue: airtableSkillObject.get('PixValue'),
    competenceId: airtableSkillObject.get('Compétence (via Tube)')[0],
  };
}

function _doQuery(filter) {
  return airtable.findRecords(tableName, usedFields)
    .then((rawSkills) => {
      return _(rawSkills)
        .filter(filter)
        .filter((rawSkill) => _.includes(rawSkill.fields['Status'], ACTIVATED_STATUS))
        .map(fromAirTableObject)
        .value();
    });
}

module.exports = {

  tableName,

  usedFields,

  fromAirTableObject,

  get(id) {
    return airtable.getRecord(tableName, id)
      .then(fromAirTableObject);
  },

  findByRecordIds(skillRecordIds) {
    return _doQuery((rawSkill) => _.includes(skillRecordIds, rawSkill.id));
  },

  findByCompetenceId(competenceId) {
    return _doQuery((rawSkill) => _.includes(rawSkill.fields['Compétence (via Tube)'], competenceId));
  },

  list() {
    return _doQuery({});
  }
};
