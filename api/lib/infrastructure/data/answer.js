const Bookshelf = require('../bookshelf');
const Answer = require('../../domain/models/Answer');

require('./assessment');

module.exports = Bookshelf.model('Answer', {

  tableName: 'answers',

  assessment() {
    return this.belongsTo('Assessment');
  },

  toDomainEntity() {
    return new Answer(this.toJSON());
  }
});
