const Bookshelf = require('../../../infrastructure/bookshelf');
const Assessment = require('./assessment');

module.exports = Bookshelf.Model.extend({
  tableName: 'skills',

  assessment() {
    return this.belongsTo(Assessment);
  }
});
