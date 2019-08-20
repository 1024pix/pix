const Bookshelf = require('../bookshelf');

require('./session');

module.exports = Bookshelf.model('CertificationCandidate', {
  tableName: 'certification-candidates',
  hasTimestamps: ['createdAt'],

  session() {
    return this.belongsTo('Session', 'sessionId');
  }
});
