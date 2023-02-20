import Bookshelf from '../bookshelf';

import './Badge';
import './Stage';
import './Organization';

const modelName = 'TargetProfile';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'target-profiles',
    hasTimestamps: ['createdAt', null],

    badges() {
      return this.hasMany('Badge', 'targetProfileId');
    },

    stages() {
      return this.hasMany('Stage', 'targetProfileId');
    },

    organizations() {
      return this.belongsToMany('Organization', 'target-profile-shares', 'targetProfileId', 'organizationId');
    },
  },
  {
    modelName,
  }
);
