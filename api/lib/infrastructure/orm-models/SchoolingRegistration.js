const Bookshelf = require('../bookshelf');

require('./User');
require('./Organization');

const modelName = 'SchoolingRegistration';

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
