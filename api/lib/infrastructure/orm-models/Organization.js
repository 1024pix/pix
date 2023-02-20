import Bookshelf from '../bookshelf';

import './Tag';

const modelName = 'Organization';

export default Bookshelf.model(
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
