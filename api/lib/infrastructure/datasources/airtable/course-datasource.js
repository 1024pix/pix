const airtable = require('../../airtable');
const { Course } = require('./objects');
const _ = require('lodash');

module.exports = {
  getAdaptiveCourses() {
    return airtable.findRecords(Course.getAirtableName(), Course.getUsedAirtableFields())
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
    return airtable.getRecord(Course.getAirtableName(), id)
      .then(Course.fromAirTableObject);
  }
};
