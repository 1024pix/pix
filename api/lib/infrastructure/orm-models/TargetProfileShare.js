const Bookshelf = require('../bookshelf.js');

require('./TargetProfile.js');

const modelName = 'TargetProfileShare';

module.exports = Bookshelf.model(
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
