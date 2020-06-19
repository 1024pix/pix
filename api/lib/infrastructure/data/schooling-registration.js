const Bookshelf = require('../bookshelf');

require('./user');
require('./organization');

const modelName = 'SchoolingRegistration';

module.exports = Bookshelf.model(modelName, {

  tableName: 'schooling-registrations',
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
