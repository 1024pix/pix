const airtable = require('../../airtable');
const airTableDataModels = require('./models');

const AIRTABLE_TABLE_NAME = 'Epreuves';

module.exports = {
  get(id) {
    return airtable.newGetRecord(AIRTABLE_TABLE_NAME, id)
      .then(airtableRawObject => airTableDataModels.Challenge.fromAirTableObject(airtableRawObject));
  }
};

