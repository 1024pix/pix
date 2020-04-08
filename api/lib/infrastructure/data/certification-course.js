const Bookshelf = require('../bookshelf');

require('./assessment');
require('./certification-challenge');
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

  assessment() {
    return this.hasOne('Assessment', 'certificationCourseId');
  },

  certificationChallenges() {
    return this.hasMany('CertificationChallenge', 'certificationCourseId');
  },

  session() {
    return this.belongsTo('Session', 'sessionId');
  }
});
