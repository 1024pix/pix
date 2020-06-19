const Bookshelf = require('../bookshelf');

require('./user');

const modelName = 'ResetPasswordDemand';

module.exports = Bookshelf.model(modelName, {

  tableName: 'reset-password-demands',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

  user() {
    return this.belongsTo('User', 'email');
  },

}, {
  modelName
});
