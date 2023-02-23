const Bookshelf = require('../bookshelf.js');
// eslint-disable-next-line no-unused-vars
const jsonColumns = require('bookshelf-json-columns');

require('./User.js');

const modelName = 'AuthenticationMethod';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'authentication-methods',
    hasTimestamps: ['createdAt', 'updatedAt'],

    user() {
      return this.belongsTo('User');
    },
  },
  {
    modelName,
    jsonColumns: ['authenticationComplement'],
  }
);
