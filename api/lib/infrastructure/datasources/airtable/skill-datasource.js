const airtable = require('../../airtable');
const { Skill: { fromAirTableObject } } = require('./objects');

const _ = require('lodash');

const AIRTABLE_TABLE_NAME = 'Acquis';

module.exports = {
  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then(fromAirTableObject);
  },

  findByRecordIds(skillRecordIds) {
    return _doQuery({})
      .then((skillDataObjects) => {
        return skillDataObjects
          .filter((rawSkill) => (
            _.includes(skillRecordIds, rawSkill.id)
          ));
      });
  },

  list() {
    return _doQuery({});
  }
};

function _doQuery(query) {
  return airtable.findRecords(AIRTABLE_TABLE_NAME, query)
    .then((airtableRawObjects) => airtableRawObjects.map(fromAirTableObject));
}
