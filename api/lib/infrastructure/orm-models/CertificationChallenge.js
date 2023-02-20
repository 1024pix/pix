import Bookshelf from '../bookshelf';

const modelName = 'CertificationChallenge';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'certification-challenges',
    hasTimestamps: ['createdAt', 'updatedAt'],
  },
  {
    modelName,
  }
);
