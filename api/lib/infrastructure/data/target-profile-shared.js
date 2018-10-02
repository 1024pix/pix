const Bookshelf = require('../bookshelf');

require('./target-profile');

module.exports = Bookshelf.model('TargetProfileShared', {

  tableName: 'target-profiles_shared',

  targetProfile() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },
});
