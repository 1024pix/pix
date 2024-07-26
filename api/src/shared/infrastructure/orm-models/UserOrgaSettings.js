import './User.js';
import './Organization.js';

import { Bookshelf } from '../../../../lib/infrastructure/bookshelf.js';

const modelName = 'UserOrgaSettings';

const BookshelfUserOrgaSetting = Bookshelf.model(
  modelName,
  {
    tableName: 'user-orga-settings',
    hasTimestamps: ['createdAt', 'updatedAt'],

    user() {
      return this.belongsTo('User', 'userId');
    },

    currentOrganization() {
      return this.belongsTo('Organization', 'currentOrganizationId');
    },
  },
  {
    modelName,
  },
);

export { BookshelfUserOrgaSetting as BookshelfUserOrgaSettings };
