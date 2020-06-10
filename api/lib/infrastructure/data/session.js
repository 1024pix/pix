const Bookshelf = require('../bookshelf');
require('./certification-candidate');

const modelName = 'Session';

module.exports = Bookshelf.model(modelName, {

  tableName: 'sessions',
  hasTimestamps: ['createdAt', null],
  requireFetch: false,

  certificationCandidates() {
    return this.hasMany('CertificationCandidate', 'sessionId');
  },

}, {
  modelName
});
