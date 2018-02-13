const Bookshelf = require('../bookshelf');

require('./organization');
require('./user');

module.exports = Bookshelf.model('Snapshot', {
  tableName: 'snapshots',

  organization() {
    return this.belongsTo('Organization');
  },

  user() {
    return this.belongsTo('User', 'userId');
  }
});
