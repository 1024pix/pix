const Bookshelf = require('../bookshelf');

require('./badge');
require('./user');

const modelName = 'BadgeAcquisition';

module.exports = Bookshelf.model(modelName, {

  tableName: 'badge-acquisitions',
  requireFetch: false,

  badge() {
    return this.belongsTo('Badge', 'badgeId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  },

}, {
  modelName
});
