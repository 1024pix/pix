const Bookshelf = require('../bookshelf');
const DomainOrganization = require('../../domain/models/Organization');

require('./user');
require('./target-profile-shares');

module.exports = Bookshelf.model('Organization', {

  tableName: 'organizations',

  // TODO Remove this link, now use organization-access
  user() {
    return this.belongsTo('User', 'userId');
  },

  targetProfileShares() {
    return this.hasMany('TargetProfileShares', 'organizationId');
  },

  toDomainEntity() {
    return new DomainOrganization(this.toJSON());
  }
});
