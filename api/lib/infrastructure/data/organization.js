const Bookshelf = require('../bookshelf');

require('./user');
require('./organization-access');
require('./target-profile-share');

module.exports = Bookshelf.model('Organization', {

  tableName: 'organizations',

  // TODO Remove this link, now use organization-access
  user() {
    return this.belongsTo('User', 'userId');
  },

  organizationAccesses() {
    return this.hasMany('OrganizationAccess', 'organizationId');
  },

  targetProfileShares() {
    return this.hasMany('TargetProfileShare', 'organizationId');
  },

});
