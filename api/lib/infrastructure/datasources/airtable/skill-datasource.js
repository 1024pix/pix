const airtable = require('../../airtable');
const { Skill: { fromAirTableObject } } = require('./objects');

const _ = require('lodash');

const AIRTABLE_TABLE_NAME = 'Acquis';
const ACTIVATED_STATUS = ['actif'];

function _doQuery(filter) {
  return airtable.findRecords(AIRTABLE_TABLE_NAME)
    .then((rawSkills) => {
      return _(rawSkills)
        .filter(filter)
        .filter((rawSkill) => _.includes(rawSkill.fields['Status'], ACTIVATED_STATUS))
        .map(fromAirTableObject)
        .value();
    });
}

module.exports = {
  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
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
