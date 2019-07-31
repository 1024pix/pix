const Bookshelf = require('../bookshelf');

require('./user');
require('./organization');

module.exports = Bookshelf.model('Student', {

  tableName: 'students',
  hasTimestamps: ['createdAt', 'updatedAt'],

  user() {
    return this.belongsTo('User', 'userId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

  parse(rawAttributes) {
    if (rawAttributes && rawAttributes.birthdate) {
      rawAttributes.birthdate = new Date(rawAttributes.birthdate);
    }

    return rawAttributes;
  },

});
