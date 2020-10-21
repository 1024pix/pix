const Bookshelf = require('../bookshelf');

require('./membership');
require('./tag');
require('./target-profile-share');

const modelName = 'Organization';

module.exports = Bookshelf.model(modelName, {

  tableName: 'organizations',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

  memberships() {
    return this.hasMany('Membership', 'organizationId');
  },

  targetProfileShares() {
    return this.hasMany('TargetProfileShare', 'organizationId');
  },

  tags() {
    return this.belongsToMany('Tag', 'organization-tags', 'organizationId',  'tagId');
  },
}, {
  modelName,
});
