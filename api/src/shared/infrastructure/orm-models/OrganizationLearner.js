import './User.js';
import './Organization.js';

import { Bookshelf } from '../../../../lib/infrastructure/bookshelf.js';

const modelName = 'OrganizationLearner';

const BookshelfOrganizationLearner = Bookshelf.model(
  modelName,
  {
    tableName: 'organization-learners',
    hasTimestamps: ['createdAt', 'updatedAt'],

    user() {
      return this.belongsTo('User', 'userId');
    },

    organization() {
      return this.belongsTo('Organization', 'organizationId');
    },
  },
  {
    modelName,
  },
);

export { BookshelfOrganizationLearner };
