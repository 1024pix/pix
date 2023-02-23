const Bookshelf = require('../bookshelf.js');

require('./Badge.js');

const modelName = 'BadgeCriterion';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'badge-criteria',

    badge() {
      return this.belongsTo('Badge');
    },
  },
  {
    modelName,
  }
);
