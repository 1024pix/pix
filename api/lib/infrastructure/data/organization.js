const Bookshelf = require('../bookshelf');

require('./tag');
require('./target-profile-share');

const modelName = 'Organization';

module.exports = Bookshelf.model(modelName, {

  tableName: 'organizations',
  hasTimestamps: ['createdAt', 'updatedAt'],

  targetProfileShares() {
    return this.hasMany('TargetProfileShare', 'organizationId');
  },

  tags() {
    return this.belongsToMany('Tag', 'organization-tags', 'organizationId', 'tagId');
  },
}, {
  modelName,
});
