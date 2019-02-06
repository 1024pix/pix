const Bookshelf = require('../bookshelf');
const BookshelfUser = require('./user');
const BookshelfPixRole = require('./pix-role');

const bookshelfName = 'UserPixRole';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'users_pix_roles',
  bookshelfName,

  user() {
    return this.belongsTo(BookshelfUser);
  },

  pixRole() {
    return this.belongsTo(BookshelfPixRole);
  }

});
