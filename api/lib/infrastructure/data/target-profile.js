const Bookshelf = require('../bookshelf');

require('./badge');
require('./target-profile-skill');
require('./target-profile-share');

module.exports = Bookshelf.model('TargetProfile', {

  tableName: 'target-profiles',
  hasTimestamps: ['createdAt', null],

  skillIds() {
    return this.hasMany('TargetProfileSkill', 'targetProfileId');
  },

  sharedWithOrganizations() {
    return this.hasMany('TargetProfileShare', 'targetProfileId');
  },

  badge() {
    return this.belongsTo('Badge', 'targetProfileId');
  }
});
