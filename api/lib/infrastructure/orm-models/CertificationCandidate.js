const Bookshelf = require('../bookshelf');

require('./Session');
require('./User');

const modelName = 'CertificationCandidate';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'certification-candidates',
    hasTimestamps: ['createdAt'],

    session() {
      return this.belongsTo('Session', 'sessionId');
    },

    user() {
      return this.belongsTo('User', 'userId');
    },
  },
  {
    modelName,
  }
);
