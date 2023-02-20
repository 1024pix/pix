import Bookshelf from '../bookshelf';

import './TargetProfile';

const modelName = 'TargetProfileShare';

export default Bookshelf.model(
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
