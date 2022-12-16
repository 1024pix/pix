const Bookshelf = require('../bookshelf');

require('./Badge');
require('./User');

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
