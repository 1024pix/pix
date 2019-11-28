const airtable = require('../../airtable');
const { Area } = require('./objects');

const TABLE_NAME = 'Domaines';

const USED_FIELDS = [
  'Code',
  'Nom',
  'Titre',
  'Competences (identifiants)',
];

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  list() {
    return airtable.findRecords(TABLE_NAME, USED_FIELDS)
      .then((airtableRawObjects) => {
        return airtableRawObjects.map((airtableRawObject) => {
          return Area.fromAirTableObject(airtableRawObject);
        });
      });
  },
};

