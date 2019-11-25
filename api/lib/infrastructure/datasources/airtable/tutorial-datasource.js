const _ = require('lodash');
const airtable = require('../../airtable');
const { Tutorial } = require('./objects');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');

function _doQuery(filter) {
  return airtable.findRecords(Tutorial.getAirtableName(), Tutorial.getUsedAirtableFields())
    .then((rawTutorials) => {
      return _(rawTutorials)
        .filter(filter)
        .map(Tutorial.fromAirTableObject)
        .value();
    });
}

module.exports = {
  findByRecordIds(tutorialRecordIds) {
    return _doQuery((rawTutorial) => _.includes(tutorialRecordIds, rawTutorial.id));
  },

  get(id) {
    return airtable.getRecord(Tutorial.getAirtableName(), id)
      .then(Tutorial.fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }
        throw err;
      });
  },
};

