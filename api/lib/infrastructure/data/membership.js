const Bookshelf = require('../bookshelf');

require('./organization');
require('./user');

module.exports = Bookshelf.model('Membership', {

  tableName: 'memberships',
  hasTimestamps: ['createdAt', 'updatedAt'],

  user() {
    return this.belongsTo('User', 'userId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

});
