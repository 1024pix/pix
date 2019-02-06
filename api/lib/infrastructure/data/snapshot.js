const Bookshelf = require('../bookshelf');

require('./organization');
require('./user');

const bookshelfName = 'Snapshot';

module.exports = Bookshelf.model(bookshelfName, {
  tableName: 'snapshots',
  bookshelfName,

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  }
});
