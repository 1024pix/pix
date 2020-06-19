const Bookshelf = require('../bookshelf');

const modelName = 'CertificationChallenge';

module.exports = Bookshelf.model(modelName, {

  tableName: 'certification-challenges',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

}, {
  modelName
});
