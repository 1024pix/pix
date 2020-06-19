const Bookshelf = require('../bookshelf');
const BookshelfUser = require('./user');
const BookshelfPixRole = require('./pix-role');

const modelName = 'UserPixRole';

module.exports = Bookshelf.model(modelName, {

  tableName: 'users_pix_roles',
  requireFetch: false,

  user() {
    return this.belongsTo(BookshelfUser);
  },

  pixRole() {
    return this.belongsTo(BookshelfPixRole);
  },

}, {
  modelName
});
