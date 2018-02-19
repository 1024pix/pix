const Bookshelf = require('../bookshelf');

require('./user');

module.exports = Bookshelf.model('ResetPasswordDemand', {
  tableName: 'reset-password-demands',

  user() {
    return this.belongsTo('User', 'email');
  }
});
