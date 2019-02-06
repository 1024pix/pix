const Bookshelf = require('../bookshelf');

require('./user');

const bookshelfName = 'ResetPasswordDemand';

module.exports = Bookshelf.model(bookshelfName, {
  tableName: 'reset-password-demands',
  bookshelfName,

  user() {
    return this.belongsTo('User', 'email');
  }
});
