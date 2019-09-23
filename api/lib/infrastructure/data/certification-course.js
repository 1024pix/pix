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

    if (rawAttributes.birthdate) {
      rawAttributes.birthdate = new Date(rawAttributes.birthdate);
    }

    return rawAttributes;
  },

  assessments() {
    return this.hasMany('Assessment', 'courseId');
  },

  challenges() {
    return this.hasMany('CertificationChallenge', 'courseId');
  },

  session() {
    return this.belongsTo('Session', 'sessionId');
  }
});
