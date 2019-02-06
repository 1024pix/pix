const Bookshelf = require('../bookshelf');

require('./assessment');

const bookshelfName = 'Feedback';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'feedbacks',
  bookshelfName,

  assessment() {
    return this.belongsTo('Assessment');
  }

});
