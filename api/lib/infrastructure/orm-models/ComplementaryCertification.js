import Bookshelf from '../bookshelf';

const modelName = 'ComplementaryCertification';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'complementary-certifications',
    hasTimestamps: ['createdAt', null],
  },
  {
    modelName,
  }
);
