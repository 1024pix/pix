const airtable = require('../airtable');
const serializer = require('../serializers/airtable/course-serializer');

const AIRTABLE_TABLE_NAME = 'Tests';
const AIRTABLE_TABLE_VIEW_PROGRESSION_COURSES = 'Tests de progression';
const AIRTABLE_TABLE_VIEW_ADAPTIVE_COURSES = 'Tests de positionnement';
const AIRTABLE_TABLE_VIEW_COURSES_OF_THE_WEEK = 'Défis de la semaine';

function _getCourses(viewName) {
  const query = {
    filterByFormula: '{Statut} = "Publié"',
    view: viewName
  };

  return airtable.findRecords(AIRTABLE_TABLE_NAME, query)
    .then(courses => courses.map(serializer.deserialize));
}

module.exports = {

  getProgressionCourses() {
    return _getCourses(AIRTABLE_TABLE_VIEW_PROGRESSION_COURSES);
  },

  getCoursesOfTheWeek() {
    return _getCourses(AIRTABLE_TABLE_VIEW_COURSES_OF_THE_WEEK);
  },

  getAdaptiveCourses() {
    return _getCourses(AIRTABLE_TABLE_VIEW_ADAPTIVE_COURSES);
  },

  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then(serializer.deserialize);
  },

};
