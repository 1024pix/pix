const Bookshelf = require('../bookshelf');
const BookshelfUser = require('./user');
const BookshelfPixRole = require('./BookshelfPixRole');

module.exports = Bookshelf.model('UserPixRole', {

  tableName: 'users_pix_roles',

  user() {
    return this.belongsTo(BookshelfUser);
  },

  pixRole() {
    return this.belongsTo(BookshelfPixRole);
  }

});
