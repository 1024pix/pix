const Bookshelf = require('../bookshelf');

require('./membership');
require('./target-profile-share');

const modelName = 'Organization';

module.exports = Bookshelf.model(modelName, {

  tableName: 'organizations',
  hasTimestamps: ['createdAt', 'updatedAt'],

  memberships() {
    return this.hasMany('Membership', 'organizationId');
  },

  targetProfileShares() {
    return this.hasMany('TargetProfileShare', 'organizationId');
  },

}, {
  modelName
});
