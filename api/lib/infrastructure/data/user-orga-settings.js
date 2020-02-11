const Bookshelf = require('../bookshelf');

require('./user');
require('./organization');

module.exports = Bookshelf.model('UserOrgaSettings', {

  tableName: 'user-orga-settings',

  user() {
    return this.belongsTo('User', 'userId');
  },

  currentOrganization() {
    return this.belongsTo('Organization', 'currentOrganizationId');
  },

});
