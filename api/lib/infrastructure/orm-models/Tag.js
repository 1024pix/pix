import { Bookshelf } from '../bookshelf.js';

const modelName = 'Tag';

const BookshelfTag = Bookshelf.model(
  modelName,
  {
    tableName: 'tags',
    hasTimestamps: ['createdAt', 'updatedAt'],
  },
  {
    modelName,
  }
);

export { BookshelfTag };
