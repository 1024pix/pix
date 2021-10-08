const Bookshelf = require('../bookshelf');

require('./TargetProfile');

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
