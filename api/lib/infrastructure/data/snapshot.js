const Bookshelf = require('../bookshelf');

require('./organization');
require('./user');

module.exports = Bookshelf.model('Snapshot', {
  tableName: 'snapshots',
  hasTimestamps: ['createdAt', 'updatedAt'],

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  }
});
