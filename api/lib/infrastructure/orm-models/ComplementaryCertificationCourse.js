import Bookshelf from '../bookshelf';

const modelName = 'ComplementaryCertificationCourse';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'complementary-certification-courses',
    hasTimestamps: ['createdAt'],
  },
  {
    modelName,
  }
);
