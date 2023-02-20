import Bookshelf from '../bookshelf';

import './Organization';
import './Tag';

const modelName = 'OrganizationTag';

export default Bookshelf.model(
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
