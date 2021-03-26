const Bookshelf = require('../bookshelf');

require('./organization');

const modelName = 'OrganizationInvitation';

module.exports = Bookshelf.model(modelName, {

  tableName: 'organization-invitations',
  hasTimestamps: ['createdAt', 'updatedAt'],

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

}, {
  modelName,
});
