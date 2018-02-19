const Bookshelf = require('../bookshelf');

require('./assessment');

module.exports = Bookshelf.model('Mark', {

  tableName: 'marks',

  assessment() {
    return this.belongsTo('Assessment');
  }
});
