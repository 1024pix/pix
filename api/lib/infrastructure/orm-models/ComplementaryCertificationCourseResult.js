const Bookshelf = require('../bookshelf');

const modelName = 'ComplementaryCertificationCourseResult';

module.exports = Bookshelf.model(
  'ComplementaryCertificationCourseResults',
  {
    tableName: 'complementary-certification-course-results',

    get idAttribute() {
      return null;
    },
  },
  {
    modelName,
  }
);
