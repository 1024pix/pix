const airtable = require('../../airtable');
const { Tutorial } = require('./objects');

module.exports = {
  get(id) {
    return airtable.getRecord(Tutorial.getAirtableName(), id)
      .then((airtableRawObject) => Tutorial.fromAirTableObject(airtableRawObject));
  }
};

