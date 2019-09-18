const airtable = require('../../airtable');
const { Skill } = require('./objects');

const _ = require('lodash');

const ACTIVATED_STATUS = ['actif'];

function _doQuery(filter) {
  return airtable.findRecords(Skill.getAirtableName(), Skill.getUsedAirtableFields())
    .then((rawSkills) => {
      return _(rawSkills)
        .filter(filter)
        .filter((rawSkill) => _.includes(rawSkill.fields['Status'], ACTIVATED_STATUS))
        .map(Skill.fromAirTableObject)
        .value();
    });
}

module.exports = {
  get(id) {
    return airtable.getRecord(Skill.getAirtableName(), id)
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
