const Bookshelf = require('../../../infrastructure/bookshelf');
const User = require('./user');

module.exports = Bookshelf.Model.extend({
  tableName: 'reset-password-demands',

  user() {
    return this.belongsTo(User, 'email');
  }
});
