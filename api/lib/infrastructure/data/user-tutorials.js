const Bookshelf = require('../bookshelf');

const modelName = 'UserTutorials';

module.exports = Bookshelf.model(modelName, {

  tableName: 'user_tutorials',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

}, {
  modelName
});
