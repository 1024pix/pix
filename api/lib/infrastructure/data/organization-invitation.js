const Bookshelf = require('../bookshelf');

require('./organization');

module.exports = Bookshelf.model('OrganizationInvitation', {

  tableName: 'organization-invitations',
  hasTimestamps: ['createdAt', 'updatedAt'],

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },
});
