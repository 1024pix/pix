const Bookshelf = require('../bookshelf');

const modelName = 'UserTutorials';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'user-saved-tutorials',
    hasTimestamps: ['createdAt', 'updatedAt'],
  },
  {
    modelName,
  }
);
