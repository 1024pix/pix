const Bookshelf = require('../bookshelf');

require('./target-profile');

module.exports = Bookshelf.model('Badge', {

  tableName: 'badges',

  targetProfile() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },
});
