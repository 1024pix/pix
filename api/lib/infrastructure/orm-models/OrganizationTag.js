const Bookshelf = require('../bookshelf.js');

require('./Organization.js');
require('./Tag.js');

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
