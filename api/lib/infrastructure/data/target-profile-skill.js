const Bookshelf = require('../bookshelf');

require('./target-profile');

const bookshelfName = 'TargetProfileSkill';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'target-profiles_skills',
  bookshelfName,

  targetProfile() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  }
});
