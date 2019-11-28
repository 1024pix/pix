const _ = require('lodash');
const airtable = require('../../airtable');
const { Skill } = require('./objects');

const TABLE_NAME = 'Acquis';

const USED_FIELDS = [
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

function _doQuery(filter) {
  return airtable.findRecords(TABLE_NAME, USED_FIELDS)
    .then((rawSkills) => {
      return _(rawSkills)
        .filter(filter)
        .filter((rawSkill) => _.includes(rawSkill.fields['Status'], ACTIVATED_STATUS))
        .map(Skill.fromAirTableObject)
        .value();
    });
}

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  get(id) {
    return airtable.getRecord(TABLE_NAME, id)
      .then(Skill.fromAirTableObject);
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
