import { Bookshelf } from '../bookshelf.js';

import './Organization.js';

const modelName = 'OrganizationInvitation';

const BookshelfOrganizationInvitation = Bookshelf.model(
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

export { BookshelfOrganizationInvitation };
