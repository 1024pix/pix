const Bookshelf = require('../../../infrastructure/bookshelf');
Bookshelf.plugin('registry');

module.exports = Bookshelf.model('Follower', {
  tableName: 'followers'
});
