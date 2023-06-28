import { Bookshelf } from '../bookshelf.js';

import './Organization.js';
import './Tag.js';

const modelName = 'OrganizationTag';

const BookshelfOrganizationTag = Bookshelf.model(
  modelName,
  {
    tableName: 'organization-tags',
    hasTimestamps: ['createdAt', 'updatedAt'],

    organization() {
      return this.belongsTo('Organization', 'organizationId');
    },

    tag() {
      return this.belongsTo('Tag', 'tagId');
    },
  },
  {
    modelName,
  }
);

export { BookshelfOrganizationTag };
