const Bookshelf = require('../bookshelf');

module.exports = Bookshelf.model('UserTutorials', {
  tableName: 'user_tutorials',
  hasTimestamps: ['createdAt', 'updatedAt'],
});
