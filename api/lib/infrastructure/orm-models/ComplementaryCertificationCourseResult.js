import { Bookshelf } from '../bookshelf.js';

const modelName = 'ComplementaryCertificationCourseResult';

const BookshelfComplementaryCertificationCourseResult = Bookshelf.model(
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

export { BookshelfComplementaryCertificationCourseResult };
