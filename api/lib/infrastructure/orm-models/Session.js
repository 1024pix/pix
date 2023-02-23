const Bookshelf = require('../bookshelf.js');
require('./CertificationCandidate.js');

const modelName = 'Session';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'sessions',
    hasTimestamps: ['createdAt', null],

    certificationCandidates() {
      return this.hasMany('CertificationCandidate', 'sessionId');
    },
  },
  {
    modelName,
  }
);
