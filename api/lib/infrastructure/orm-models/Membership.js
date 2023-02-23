const Bookshelf = require('../bookshelf.js');

require('./Organization.js');
require('./User.js');

const modelName = 'Membership';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'memberships',
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
