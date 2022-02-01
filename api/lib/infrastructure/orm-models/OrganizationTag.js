const Bookshelf = require('../bookshelf');

require('./Organization');
require('./Tag');

const modelName = 'OrganizationTag';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'organization-tags',
    hasTimestamps: ['createdAt', 'updatedAt'],

    organization() {
      return this.belongsTo('Organization', 'organizationId');
    },

    tag() {
      return this.belongsTo('Tag', 'tagId');
    },
  },
  {
    modelName,
  }
);
