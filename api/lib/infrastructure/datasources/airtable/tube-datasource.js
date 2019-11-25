const _ = require('lodash');
const airtable = require('../../airtable');
const { Tube } = require('./objects');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');

function _doQuery(filter) {
  return airtable.findRecords(Tube.getAirtableName(), Tube.getUsedAirtableFields())
    .then((rawTubes) => {
      return _(rawTubes)
        .filter(filter)
        .map(Tube.fromAirTableObject)
        .value();
    });
}

module.exports = {
  findByNames(tubeNames) {
    return _doQuery((rawTube) => _.includes(tubeNames, rawTube.fields['Nom']));
  },

  get(id) {
    return airtable.getRecord(Tube.getAirtableName(), id)
      .then(Tube.fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }
        throw err;
      });
  },

  list() {
    return _doQuery({});
  },
};
