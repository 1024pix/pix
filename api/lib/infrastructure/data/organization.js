const Bookshelf = require('../bookshelf');

require('./user');
require('./membership');
require('./target-profile-share');

const bookshelfName = 'Organization';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'organizations',
  bookshelfName,

  // TODO Remove this link, now use membership
  user() {
    return this.belongsTo('User', 'userId');
  },

  memberships() {
    return this.hasMany('Membership', 'organizationId');
  },

  targetProfileShares() {
    return this.hasMany('TargetProfileShare', 'organizationId');
  },

});
