const Bookshelf = require('../bookshelf');
const BookshelfUser = require('./User');
const BookshelfUserPixRole = require('./UserPixRole');

const modelName = 'PixRole';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'pix_roles',

    user() {
      return this.belongsToMany(BookshelfUser).through(BookshelfUserPixRole);
    },
  },
  {
    modelName,
  }
);
