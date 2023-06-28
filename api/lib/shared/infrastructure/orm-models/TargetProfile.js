import { Bookshelf } from '../bookshelf.js';

import './Badge.js';
import './Stage.js';
import './Organization.js';

const modelName = 'TargetProfile';

const BookshelfTargetProfile = Bookshelf.model(
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

export { BookshelfTargetProfile };
