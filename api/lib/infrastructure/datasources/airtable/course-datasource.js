const _ = require('lodash');
const airtable = require('../../airtable');
const { Course } = require('./objects');

const TABLE_NAME = 'Tests';

const USED_FIELDS = [
  'Nom',
  'Description',
  'Adaptatif ?',
  'Competence',
  'Épreuves',
  'Image',
];

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  getAdaptiveCourses() {
    return airtable.findRecords(TABLE_NAME, USED_FIELDS)
      .then((airtableRawObjects) => {
        return _.filter(airtableRawObjects, {
          fields: {
            'Adaptatif ?': true,
            'Statut': 'Publié',
          }
        }).map(Course.fromAirTableObject);
      });
  },

  get(id) {
    return airtable.getRecord(TABLE_NAME, id)
      .then(Course.fromAirTableObject);
  }
};
