const Bookshelf = require('../bookshelf');

require('./assessment');
require('./certification-challenge');
require('./certification-partner-acquisition');
require('./session');

module.exports = Bookshelf.model('CertificationCourse', {
  tableName: 'certification-courses',
  hasTimestamps: ['createdAt', 'updatedAt'],

  parse(rawAttributes) {
    if (rawAttributes.completedAt) {
      rawAttributes.completedAt = new Date(rawAttributes.completedAt);
    }

    return rawAttributes;
  },

  acquiredPartnerCertifications() {
    return this.hasMany('CertificationPartnerAcquisition', 'certificationCourseId');
  },

  assessment() {
    return this.hasOne('Assessment', 'certificationCourseId');
  },

  challenges() {
    return this.hasMany('CertificationChallenge', 'courseId');
  },

  session() {
    return this.belongsTo('Session', 'sessionId');
  }
});
