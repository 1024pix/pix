const Bookshelf = require('../bookshelf.js');

require('./User.js');

const modelName = 'ResetPasswordDemand';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'reset-password-demands',
    hasTimestamps: ['createdAt', 'updatedAt'],

    user() {
      return this.belongsTo('User', 'email');
    },
  },
  {
    modelName,
  }
);
