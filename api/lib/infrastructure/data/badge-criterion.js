const Bookshelf = require('../bookshelf');

require('./badge');

module.exports = Bookshelf.model('BadgeCriterion', {
  tableName: 'badge-criteria',

  badge() {
    return this.belongsTo('Badge');
  },
});
