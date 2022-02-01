const Bookshelf = require('../bookshelf');

require('./Tag');
require('./TargetProfileShare');

const modelName = 'Organization';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'organizations',
    hasTimestamps: ['createdAt', 'updatedAt'],

    targetProfileShares() {
      return this.hasMany('TargetProfileShare', 'organizationId');
    },

    tags() {
      return this.belongsToMany('Tag', 'organization-tags', 'organizationId', 'tagId');
    },
  },
  {
    modelName,
  }
);
