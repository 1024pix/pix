const airtable = require('../../airtable');
const { Competence } = require('./objects');

module.exports = {
  list() {
    return airtable.findRecords(Competence.getAirtableName(), Competence.getUsedAirtableFields())
      .then((airtableRawObjects) => airtableRawObjects.map(Competence.fromAirTableObject));
  },

  get(id) {
    return airtable.getRecord(Competence.getAirtableName(), id)
      .then(Competence.fromAirTableObject);
  }
};

