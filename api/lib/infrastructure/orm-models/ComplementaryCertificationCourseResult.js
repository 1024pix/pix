import Bookshelf from '../bookshelf';

const modelName = 'ComplementaryCertificationCourseResult';

export default Bookshelf.model(
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
