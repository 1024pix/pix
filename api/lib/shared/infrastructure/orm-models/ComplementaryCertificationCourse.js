import { Bookshelf } from '../bookshelf.js';

const modelName = 'ComplementaryCertificationCourse';

const BookshelfComplementaryCertificationCourse = Bookshelf.model(
  modelName,
  {
    tableName: 'complementary-certification-courses',
    hasTimestamps: ['createdAt'],
  },
  {
    modelName,
  }
);

export { BookshelfComplementaryCertificationCourse };
