const Bookshelf = require('../bookshelf');

require('./target-profile-skill');
require('./target-profile-share');

module.exports = Bookshelf.model('TargetProfile', {

  tableName: 'target-profiles',

  skillIds() {
    return this.hasMany('TargetProfileSkill', 'targetProfileId');
  },

  sharedWithOrganizations() {
    return this.hasMany('TargetProfileShare', 'targetProfileId');
  }
});
