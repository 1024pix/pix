import Bookshelf from '../bookshelf';

import './Organization';

const modelName = 'OrganizationInvitation';

export default Bookshelf.model(
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
