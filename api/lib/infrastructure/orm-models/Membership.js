import Bookshelf from '../bookshelf';

import './Organization';
import './User';

const modelName = 'Membership';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'memberships',
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
  }
);
