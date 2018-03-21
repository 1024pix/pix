const Bookshelf = require('../bookshelf');
const BookshelfUser = require('./user');
const BookshelfUserPixRole = require('./BookshelfUserPixRole');

module.exports = Bookshelf.model('PixRole', {

  tableName: 'pix_roles',

  user() {
    return this.belongsToMany(BookshelfUser).through(BookshelfUserPixRole);
  },

});
