const Bookshelf = require('../bookshelf');

require('./badge');

const modelName = 'BadgeCriterion';

module.exports = Bookshelf.model(modelName, {

  tableName: 'badge-criteria',
  requireFetch: false,

  badge() {
    return this.belongsTo('Badge');
  },

}, {
  modelName
});
