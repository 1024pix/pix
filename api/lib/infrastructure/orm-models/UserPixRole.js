const Bookshelf = require('../bookshelf');
const BookshelfUser = require('./User');
const BookshelfPixRole = require('./PixRole');

const modelName = 'UserPixRole';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'users_pix_roles',

    user() {
      return this.belongsTo(BookshelfUser);
    },

    pixRole() {
      return this.belongsTo(BookshelfPixRole);
    },
  },
  {
    modelName,
  }
);
