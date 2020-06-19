const Bookshelf = require('../bookshelf');
const BookshelfUser = require('./user');
const BookshelfUserPixRole = require('./user-pix-role');

const modelName = 'PixRole';

module.exports = Bookshelf.model(modelName, {

  tableName: 'pix_roles',
  requireFetch: false,

  user() {
    return this.belongsToMany(BookshelfUser).through(BookshelfUserPixRole);
  },

}, {
  modelName
});
