const Bookshelf = require('../bookshelf');

require('./session');
require('./user');

const modelName = 'CertificationCandidate';

module.exports = Bookshelf.model(modelName, {

  tableName: 'certification-candidates',
  hasTimestamps: ['createdAt'],
  requireFetch: false,

  session() {
    return this.belongsTo('Session', 'sessionId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  },

}, {
  modelName
});
