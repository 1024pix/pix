const Bookshelf = require('../bookshelf');

require('./target-profile-skill');

module.exports = Bookshelf.model('TargetProfile', {

  tableName: 'target-profiles',

  skillIds() {
    return this.hasMany('TargetProfileSkill', 'targetProfileId');
  }
});
