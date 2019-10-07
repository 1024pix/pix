const airtable = require('../../airtable');
const { Course } = require('./objects');
const _ = require('lodash');

const AIRTABLE_TABLE_NAME = 'Tests';

module.exports = {
  getAdaptiveCourses() {
    return airtable.findRecords(AIRTABLE_TABLE_NAME)
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
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then(Course.fromAirTableObject);
  }
};

