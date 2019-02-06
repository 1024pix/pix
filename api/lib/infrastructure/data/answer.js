const Bookshelf = require('../bookshelf');
const Answer = require('../../domain/models/Answer');

require('./assessment');

const bookshelfName = 'Answer';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'answers',
  bookshelfName,

  assessment() {
    return this.belongsTo('Assessment');
  },

  toDomainEntity() {
    return new Answer(this.toJSON());
  }
});
