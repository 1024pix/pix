const _ = require('lodash');
const airtable = require('../../airtable');
const { Tube } = require('./objects');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');

const TABLE_NAME = 'Tubes';

const USED_FIELDS = [
  'Nom',
  'Titre',
  'Description',
  'Titre pratique',
  'Description pratique',
];

function _doQuery(filter) {
  return airtable.findRecords(TABLE_NAME, USED_FIELDS)
    .then((rawTubes) => {
      return _(rawTubes)
        .filter(filter)
        .map(Tube.fromAirTableObject)
        .value();
    });
}

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  findByNames(tubeNames) {
    return _doQuery((rawTube) => _.includes(tubeNames, rawTube.fields['Nom']));
  },

  get(id) {
    return airtable.getRecord(TABLE_NAME, id)
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
