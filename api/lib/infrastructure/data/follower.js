const Bookshelf = require('../bookshelf');

module.exports = Bookshelf.model('Follower', {
  tableName: 'followers'
});
