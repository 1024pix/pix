const Bookshelf = require('../bookshelf');

require('./target-profile');

const modelName = 'TargetProfileShare';

module.exports = Bookshelf.model(modelName, {

  tableName: 'target-profile-shares',
  hasTimestamps: ['createdAt', null],
  requireFetch: false,

  targetProfile() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

}, {
  modelName
});
