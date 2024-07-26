import './Tag.js';

import { Bookshelf } from '../../../../lib/infrastructure/bookshelf.js';

const modelName = 'Organization';

const BookshelfOrganization = Bookshelf.model(
  modelName,
  {
    tableName: 'organizations',
    hasTimestamps: ['createdAt', 'updatedAt'],

    tags() {
      return this.belongsToMany('Tag', 'organization-tags', 'organizationId', 'tagId');
    },
  },
  {
    modelName,
  },
);

export { BookshelfOrganization };
