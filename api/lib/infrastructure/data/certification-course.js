const Bookshelf = require('../bookshelf');

require('./assessment');
require('./certification-challenge');
require('./session');

module.exports = Bookshelf.model('CertificationCourse', {
  tableName: 'certification-courses',
  hasTimestamps: ['createdAt', 'updatedAt'],

  assessment() {
    return this.hasOne('Assessment', 'courseId');
  },

  challenges() {
    return this.hasMany('CertificationChallenge', 'courseId');
  },

  session() {
    return this.belongsTo('Session', 'sessionId');
  },

  parse(rawAttributes) {
    if (rawAttributes.completedAt) {
      rawAttributes.completedAt = new Date(rawAttributes.completedAt);
    }

    if (rawAttributes.birthdate) {
      rawAttributes.birthdate = new Date(rawAttributes.birthdate);
    }

    if('isPublished' in rawAttributes && rawAttributes.isPublished !== null) {
      rawAttributes.isPublished = Boolean(rawAttributes.isPublished);
    }

    return rawAttributes;
  },

});
