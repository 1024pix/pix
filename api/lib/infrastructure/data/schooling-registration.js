const Bookshelf = require('../bookshelf');

require('./user');
require('./organization');

module.exports = Bookshelf.model('SchoolingRegistration', {

  tableName: 'schooling-registrations',
  hasTimestamps: ['createdAt', 'updatedAt'],

  user() {
    return this.belongsTo('User', 'userId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

});
