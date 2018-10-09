const airtable = require('../../airtable');
const { Skill: { fromAirTableObject } } = require('./objects');

const AIRTABLE_TABLE_NAME = 'Acquis';

function _doQuery(query) {
  return airtable.findRecords(AIRTABLE_TABLE_NAME, query)
    .then((airtableRawObjects) => airtableRawObjects.map(fromAirTableObject));
}

module.exports = {
  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then(fromAirTableObject);
  },

  findByRecordIds(skillRecordIds) {
    const listOfAirtableFilters = skillRecordIds.map((recordId) => {
      return `RECORD_ID()="${recordId}"`;
    });

    return _doQuery({ filterByFormula: `OR(${listOfAirtableFilters.join(', ')})` });
  },

  list() {
    return _doQuery({});
  }
};

