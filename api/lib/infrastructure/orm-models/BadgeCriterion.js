const Bookshelf = require('../bookshelf');

require('./Badge');

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
