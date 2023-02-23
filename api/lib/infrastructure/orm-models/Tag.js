const Bookshelf = require('../bookshelf.js');

const modelName = 'Tag';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'tags',
    hasTimestamps: ['createdAt', 'updatedAt'],
  },
  {
    modelName,
  }
);
