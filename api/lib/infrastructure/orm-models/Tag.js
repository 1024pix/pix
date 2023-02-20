import Bookshelf from '../bookshelf';

const modelName = 'Tag';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'tags',
    hasTimestamps: ['createdAt', 'updatedAt'],
  },
  {
    modelName,
  }
);
