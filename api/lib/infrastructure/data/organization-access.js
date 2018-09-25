const Bookshelf = require('../bookshelf');

require('./user');
require('./organization');
require('./organization-role');

module.exports = Bookshelf.model('OrganizationAccess', {

  tableName: 'organizations-accesses',

  user() {
    return this.belongsTo('User', 'userId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

  organizationRole() {
    return this.belongsTo('OrganizationRole', 'organizationRoleId');
  },

});
