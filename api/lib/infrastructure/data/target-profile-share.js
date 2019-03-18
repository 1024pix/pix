const Bookshelf = require('../bookshelf');

require('./target-profile');

module.exports = Bookshelf.model('TargetProfileShare', {

  tableName: 'target-profile-shares',
  hasTimestamps: ['createdAt', null],

  targetProfile() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },
});
