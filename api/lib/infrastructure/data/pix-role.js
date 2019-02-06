const Bookshelf = require('../bookshelf');
const BookshelfUser = require('./user');
const BookshelfUserPixRole = require('./user-pix-role');

const bookshelfName = 'PixRole';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'pix_roles',
  bookshelfName,

  user() {
    return this.belongsToMany(BookshelfUser).through(BookshelfUserPixRole);
  },

});
