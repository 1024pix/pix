const Bookshelf = require('../bookshelf');
// eslint-disable-next-line no-unused-vars
const jsonColumns = require('bookshelf-json-columns');

require('./user');

const modelName = 'AuthenticationMethod';

module.exports = Bookshelf.model(modelName, {

  tableName: 'authentication-methods',
  hasTimestamps: ['createdAt', 'updatedAt'],

  user() {
    return this.belongsTo('User');
  },

}, {
  modelName,
  jsonColumns: ['authenticationComplement'],
});
