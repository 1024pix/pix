import { Bookshelf } from '../bookshelf.js';

import './TargetProfile.js';

const modelName = 'TargetProfileShare';

const BookshelfTargetProfileShare = Bookshelf.model(
  modelName,
  {
    tableName: 'target-profile-shares',
    hasTimestamps: ['createdAt', null],

    targetProfile() {
      return this.belongsTo('TargetProfile', 'targetProfileId');
    },

    organization() {
      return this.belongsTo('Organization', 'organizationId');
    },
  },
  {
    modelName,
  }
);

export { BookshelfTargetProfileShare };
