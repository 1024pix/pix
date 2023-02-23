const Bookshelf = require('../bookshelf.js');

require('./User.js');
require('./Organization.js');

const modelName = 'OrganizationLearner';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'organization-learners',
    hasTimestamps: ['createdAt', 'updatedAt'],

    user() {
      return this.belongsTo('User', 'userId');
    },

    organization() {
      return this.belongsTo('Organization', 'organizationId');
    },
  },
  {
    modelName,
  }
);
