const Bookshelf = require('../bookshelf');

require('./organization');
require('./organization-role');

const bookshelfName = 'Membership';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'memberships',
  bookshelfName,

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
