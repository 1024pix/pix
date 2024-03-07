import './Organization.js';

import { Bookshelf } from '../bookshelf.js';

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
  },
);

export { BookshelfOrganizationInvitation };
