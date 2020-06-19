const Bookshelf = require('../bookshelf');

require('./organization');
require('./user');

const modelName = 'Membership';

module.exports = Bookshelf.model(modelName, {

  tableName: 'memberships',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

  user() {
    return this.belongsTo('User', 'userId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

}, {
  modelName
});
