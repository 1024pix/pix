const Bookshelf = require('../bookshelf');
require('./certification-course');
require('./certification-candidate');

module.exports = Bookshelf.model('Session', {
  tableName: 'sessions',
  hasTimestamps: ['createdAt', null],

  certificationCourses() {
    return this.hasMany('CertificationCourse', 'sessionId');
  },

  certificationCandidates() {
    return this.hasMany('CertificationCandidate', 'sessionId');
  },
});
