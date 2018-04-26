const airtable = require('../../airtable');
const airTableDataObjects = require('./objects');

const AIRTABLE_TABLE_NAME = 'Epreuves';

module.exports = {
  get(id) {
    return airtable.newGetRecord(AIRTABLE_TABLE_NAME, id)
      .then(airtableRawObject => airTableDataObjects.Challenge.fromAirTableObject(airtableRawObject));
  }
};

