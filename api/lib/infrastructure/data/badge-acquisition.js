const Bookshelf = require('../bookshelf');

require('./badge');
require('./user');

module.exports = Bookshelf.model('BadgeAcquisition', {

  tableName: 'badge-acquisitions',

  badge() {
    return this.belongsTo('Badge', 'badgeId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  },
});
