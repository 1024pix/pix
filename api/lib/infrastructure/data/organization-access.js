const Bookshelf = require('../bookshelf');

require('./organization');
require('./organization-role');

module.exports = Bookshelf.model('OrganizationAccess', {

  tableName: 'organizations-accesses',

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

  organizationRole() {
    return this.belongsTo('OrganizationRole', 'organizationRoleId');
  },

});
