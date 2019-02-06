const Bookshelf = require('../bookshelf');

require('./target-profile-skill');
require('./target-profile-share');

const bookshelfName = 'TargetProfile';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'target-profiles',
  bookshelfName,

  skillIds() {
    return this.hasMany('TargetProfileSkill', 'targetProfileId');
  },

  sharedWithOrganizations() {
    return this.hasMany('TargetProfileShare', 'targetProfileId');
  }
});
