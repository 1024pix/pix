const airtable = require('../airtable');
const serializer = require('../serializers/airtable/course-serializer');
const _ = require('lodash');

// TODO refactor to use a course-datasource

const AIRTABLE_TABLE_NAME = 'Tests';

function _getCourses(filter) {
  return airtable.findRecords(AIRTABLE_TABLE_NAME)
    .then((courses) => {
      return _.filter(courses, {
        fields: filter
      }).map(serializer.deserialize);
    });
}

module.exports = {

  getProgressionCourses() {
    return _getCourses({
      'Adaptatif ?': false,
      'Défi de la semaine ?': false,
      'Statut': 'Publié',
    });
  },

  getCoursesOfTheWeek() {
    return _getCourses({
      'Défi de la semaine ?': true,
      'Statut': 'Publié',
    });
  },

  getAdaptiveCourses() {
    return _getCourses({
      'Adaptatif ?': true,
      'Statut': 'Publié',
    });
  },

  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then(serializer.deserialize);
  },

};
