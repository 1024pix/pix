const airtable = require('../../airtable');
const { Competence: { fromAirTableObject } } = require('./objects');

const AIRTABLE_TABLE_NAME = 'Competences';

module.exports = {
  list() {
    return airtable.findRecords(AIRTABLE_TABLE_NAME)
      .then((airtableRawObjects) => airtableRawObjects.map(fromAirTableObject));
  },

  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then(fromAirTableObject);
  }
};

