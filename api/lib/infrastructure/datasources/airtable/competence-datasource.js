const airtable = require('../../airtable');
const { Competence } = require('./objects');

const TABLE_NAME = 'Competences';

const USED_FIELDS = [
  'Titre',
  'Sous-domaine',
  'Description',
  'Domaine',
  'Tests',
  'Acquis (via Tubes)'
];

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  list() {
    return airtable.findRecords(TABLE_NAME, USED_FIELDS)
      .then((airtableRawObjects) => airtableRawObjects.map(Competence.fromAirTableObject));
  },

  get(id) {
    return airtable.getRecord(TABLE_NAME, id)
      .then(Competence.fromAirTableObject);
  }
};

