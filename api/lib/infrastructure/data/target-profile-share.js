const Bookshelf = require('../bookshelf');

require('./target-profile');

const bookshelfName = 'TargetProfileShare';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'target-profile-shares',
  bookshelfName,

  targetProfile() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },
});
