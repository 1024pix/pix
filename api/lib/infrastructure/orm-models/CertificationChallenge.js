import { Bookshelf } from '../bookshelf.js';

const modelName = 'CertificationChallenge';

const BookshelfCertificationChallenge = Bookshelf.model(
  modelName,
  {
    tableName: 'certification-challenges',
    hasTimestamps: ['createdAt', 'updatedAt'],
  },
  {
    modelName,
  }
);

export { BookshelfCertificationChallenge };
