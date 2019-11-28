const _ = require('lodash');
const airtable = require('../../airtable');
const { Tutorial } = require('./objects');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');

const TABLE_NAME = 'Tutoriels';

const USED_FIELDS = [
  'Durée',
  'Format',
  'Lien',
  'Source',
  'Titre',
];

function _doQuery(filter) {
  return airtable.findRecords(TABLE_NAME, USED_FIELDS)
    .then((rawTutorials) => {
      return _(rawTutorials)
        .filter(filter)
        .map(Tutorial.fromAirTableObject)
        .value();
    });
}

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  findByRecordIds(tutorialRecordIds) {
    return _doQuery((rawTutorial) => _.includes(tutorialRecordIds, rawTutorial.id));
  },

  get(id) {
    return airtable.getRecord(TABLE_NAME, id)
      .then(Tutorial.fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }
        throw err;
      });
  },
};

