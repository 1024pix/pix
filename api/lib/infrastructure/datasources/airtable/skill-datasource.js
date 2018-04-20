const airtable = require('../../airtable');
const airTableDataModels = require('./models');

const AIRTABLE_TABLE_NAME = 'Acquis';

module.exports = {
  get(id) {
    return airtable.newGetRecord(AIRTABLE_TABLE_NAME, id)
      .then(airtableRawObject => airTableDataModels.Skill.fromAirTableObject(airtableRawObject));
  }
};

