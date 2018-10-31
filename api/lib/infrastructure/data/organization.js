const Bookshelf = require('../bookshelf');

require('./user');
require('./membership');
require('./target-profile-share');

module.exports = Bookshelf.model('Organization', {

  tableName: 'organizations',

  // TODO Remove this link, now use membership
  user() {
    return this.belongsTo('User', 'userId');
  },

  memberships() {
    return this.hasMany('Membership', 'organizationId');
  },

  targetProfileShares() {
    return this.hasMany('TargetProfileShare', 'organizationId');
  },

});
