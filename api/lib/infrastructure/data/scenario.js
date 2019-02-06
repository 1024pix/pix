const Bookshelf = require('../bookshelf');

const bookshelfName = 'Scenario';

module.exports = Bookshelf.model(bookshelfName, {
  tableName: 'scenarios',
  bookshelfName,
});
