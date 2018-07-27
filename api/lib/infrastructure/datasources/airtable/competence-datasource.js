const airtable = require('../../airtable');
const airTableDataObjects = require('./objects');

const AIRTABLE_TABLE_NAME = 'Competences';

module.exports = {
  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then((airtableRawObject) => airTableDataObjects.Competence.fromAirTableObject(airtableRawObject));
  }
};

