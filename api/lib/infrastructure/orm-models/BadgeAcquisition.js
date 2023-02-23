const Bookshelf = require('../bookshelf.js');

require('./Badge.js');
require('./User.js');

const modelName = 'BadgeAcquisition';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'badge-acquisitions',

    badge() {
      return this.belongsTo('Badge', 'badgeId');
    },

    user() {
      return this.belongsTo('User', 'userId');
    },
  },
  {
    modelName,
  }
);
