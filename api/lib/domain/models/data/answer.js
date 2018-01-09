const Bookshelf = require('../../../infrastructure/bookshelf');

Bookshelf.plugin('registry');

require('./assessment');

module.exports = Bookshelf.model('Answer', {

  tableName: 'answers',

  assessment() {
    return this.belongsTo('Assessment');
  }
});
