const Bookshelf = require('../bookshelf');

require('./session');
require('./user');

module.exports = Bookshelf.model('CertificationCandidate', {
  tableName: 'certification-candidates',
  hasTimestamps: ['createdAt'],

  session() {
    return this.belongsTo('Session', 'sessionId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  },
});
