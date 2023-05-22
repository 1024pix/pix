import { Bookshelf } from '../bookshelf.js';

import './Tag.js';

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
  }
);

export { BookshelfOrganization };
