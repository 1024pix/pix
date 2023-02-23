const Bookshelf = require('../bookshelf.js');

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
