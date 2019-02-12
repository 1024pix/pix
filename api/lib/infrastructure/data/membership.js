const Bookshelf = require('../bookshelf');

require('./organization');
require('./organization-role');

module.exports = Bookshelf.model('Membership', {

  tableName: 'memberships',

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
