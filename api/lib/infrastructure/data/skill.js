const Bookshelf = require('../bookshelf');

require('./assessment');

const bookshelfName = 'Skill';

module.exports = Bookshelf.model(bookshelfName, {
  tableName: 'skills',
  bookshelfName,

  assessment() {
    return this.belongsTo('Assessment');
  }
});
