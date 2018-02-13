const Bookshelf = require('../bookshelf');

require('./assessment');

module.exports = Bookshelf.model('Answer', {

  tableName: 'answers',

  assessment() {
    return this.belongsTo('Assessment');
  }
});
