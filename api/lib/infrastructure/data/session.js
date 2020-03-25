const Bookshelf = require('../bookshelf');
require('./certification-candidate');

module.exports = Bookshelf.model('Session', {
  tableName: 'sessions',
  hasTimestamps: ['createdAt', null],

  certificationCandidates() {
    return this.hasMany('CertificationCandidate', 'sessionId');
  },
});
