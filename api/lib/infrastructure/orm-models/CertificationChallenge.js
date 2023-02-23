const Bookshelf = require('../bookshelf.js');

const modelName = 'CertificationChallenge';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'certification-challenges',
    hasTimestamps: ['createdAt', 'updatedAt'],
  },
  {
    modelName,
  }
);
