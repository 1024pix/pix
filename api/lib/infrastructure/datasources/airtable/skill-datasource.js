const airtable = require('../../airtable');
const airTableDataObjects = require('./objects');

const AIRTABLE_TABLE_NAME = 'Acquis';

module.exports = {
  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then((airtableRawObject) => airTableDataObjects.Skill.fromAirTableObject(airtableRawObject));
  }
};

