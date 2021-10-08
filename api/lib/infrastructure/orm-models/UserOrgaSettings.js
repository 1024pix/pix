const Bookshelf = require('../bookshelf');

require('./User');
require('./Organization');

const modelName = 'UserOrgaSettings';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'user-orga-settings',
    hasTimestamps: ['createdAt', 'updatedAt'],

    user() {
      return this.belongsTo('User', 'userId');
    },

    currentOrganization() {
      return this.belongsTo('Organization', 'currentOrganizationId');
    },
  },
  {
    modelName,
  }
);
