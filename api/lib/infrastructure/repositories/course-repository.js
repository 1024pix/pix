const airtable = require('../airtable');
const serializer = require('../serializers/airtable/course-serializer');
const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');

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

  getCourseName(id) {
    return this.get(id)
      .then((course) => {
        return course.name;
      })
      .catch(() => {
        throw new NotFoundError('Le test demandé n\'existe pas');
      });
  }
};
