const Bookshelf = require('../bookshelf.js');

require('./Tag.js');

const modelName = 'Organization';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'organizations',
    hasTimestamps: ['createdAt', 'updatedAt'],

    tags() {
      return this.belongsToMany('Tag', 'organization-tags', 'organizationId', 'tagId');
    },
  },
  {
    modelName,
  }
);
