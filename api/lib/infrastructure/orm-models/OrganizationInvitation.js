const Bookshelf = require('../bookshelf.js');

require('./Organization.js');

const modelName = 'OrganizationInvitation';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'organization-invitations',
    hasTimestamps: ['createdAt', 'updatedAt'],

    organization() {
      return this.belongsTo('Organization', 'organizationId');
    },
  },
  {
    modelName,
  }
);
