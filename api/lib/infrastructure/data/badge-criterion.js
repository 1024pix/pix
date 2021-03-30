const Bookshelf = require('../bookshelf');

require('./badge');

const modelName = 'BadgeCriterion';

module.exports = Bookshelf.model(modelName, {

  tableName: 'badge-criteria',

  badge() {
    return this.belongsTo('Badge');
  },

}, {
  modelName,
});
