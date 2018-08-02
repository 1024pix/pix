const Bookshelf = require('../bookshelf');

require('./target-profile');

module.exports = Bookshelf.model('TargetProfileSkill', {

  tableName: 'target-profiles_skills',

  targetProfile() {
    return this.belongsTo('TargetProfile', 'targetProfileId')
  }
});
