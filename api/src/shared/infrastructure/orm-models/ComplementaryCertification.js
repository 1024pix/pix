import { Bookshelf } from '../../../../lib/infrastructure/bookshelf.js';

const modelName = 'ComplementaryCertification';

const BookshelfComplementaryCertification = Bookshelf.model(
  modelName,
  {
    tableName: 'complementary-certifications',
    hasTimestamps: ['createdAt', null],
  },
  {
    modelName,
  },
);

export { BookshelfComplementaryCertification };
