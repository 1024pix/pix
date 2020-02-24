const Bookshelf = require('../bookshelf');

require('./membership');
require('./target-profile-share');

module.exports = Bookshelf.model('Organization', {

  tableName: 'organizations',
  hasTimestamps: ['createdAt', 'updatedAt'],

  memberships() {
    return this.hasMany('Membership', 'organizationId');
  },

  targetProfileShares() {
    return this.hasMany('TargetProfileShare', 'organizationId');
  },

});
