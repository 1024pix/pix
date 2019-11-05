const Bookshelf = require('../bookshelf');
const moment = require('moment');
require('./certification-course');
require('./certification-candidate');

module.exports = Bookshelf.model('Session', {
  tableName: 'sessions',
  hasTimestamps: ['createdAt', null],

  parse(rawAttributes) {
    if (rawAttributes && rawAttributes.date) {
      rawAttributes.date = moment(rawAttributes.date).format('YYYY-MM-DD');
    }

    return rawAttributes;
  },

  certificationCourses() {
    return this.hasMany('CertificationCourse', 'sessionId');
  },

  certificationCandidates() {
    return this.hasMany('CertificationCandidate', 'sessionId');
  },
});
