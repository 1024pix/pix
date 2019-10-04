const airtable = require('../../airtable');
const { Area } = require('./objects');

module.exports = {
  list() {
    return airtable.findRecords(Area.getAirtableName(), Area.getUsedAirtableFields())
      .then((airtableRawObjects) => {
        return airtableRawObjects.map((airtableRawObject) => {
          return Area.fromAirTableObject(airtableRawObject);
        });
      });
  },
};

