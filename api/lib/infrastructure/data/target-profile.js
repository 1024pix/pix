const Bookshelf = require('../bookshelf');

require('./target-profile-skill');
require('./target-profile-shared');

module.exports = Bookshelf.model('TargetProfile', {

  tableName: 'target-profiles',

  skillIds() {
    return this.hasMany('TargetProfileSkill', 'targetProfileId');
  },

  organizationsWhichShared() {
    return this.hasMany('TargetProfileShared', 'targetProfileId');
  }
});
