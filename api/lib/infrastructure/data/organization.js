const Bookshelf = require('../bookshelf');
const DomainOrganization = require('../../domain/models/Organization');

require('./user');

module.exports = Bookshelf.model('Organization', {

  tableName: 'organizations',

  user() {
    return this.belongsTo('User', 'userId');
  },

  toDomainEntity() {
    return new DomainOrganization(this.toJSON());
  }
});
