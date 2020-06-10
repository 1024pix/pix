const Bookshelf = require('../bookshelf');

require('./badge');
require('./target-profile-skill');

module.exports = Bookshelf.model('TargetProfile', {

  tableName: 'target-profiles',
  hasTimestamps: ['createdAt', null],

  skillIds() {
    return this.hasMany('TargetProfileSkill', 'targetProfileId');
  },

  badge() {
    return this.belongsTo('Badge', 'targetProfileId');
  }
});
