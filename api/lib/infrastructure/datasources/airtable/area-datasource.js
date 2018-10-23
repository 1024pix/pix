const airtable = require('../../airtable');
const airTableDataObjects = require('./objects');

const AIRTABLE_TABLE_NAME = 'Domaines';

module.exports = {
  list() {
    return airtable.findRecords(AIRTABLE_TABLE_NAME)
      .then((airtableRawObjects) => {
        return airtableRawObjects.map((airtableRawObject) => {
          return airTableDataObjects.Area.fromAirTableObject(airtableRawObject);
        });
      });
  },
};

