const Bookshelf = require('../bookshelf');

require('./organization');
require('./user');

module.exports = Bookshelf.model('Membership', {

  tableName: 'memberships',

  user() {
    return this.belongsTo('User', 'userId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

});
