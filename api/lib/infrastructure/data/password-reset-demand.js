const Bookshelf = require('../bookshelf');

module.exports = Bookshelf.model('PasswordResetDemand', {
  tableName: 'password-reset-demands',
  hasTimestamps: ['createdAt', 'updatedAt'],
});
