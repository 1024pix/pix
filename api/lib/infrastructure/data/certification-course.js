const Bookshelf = require('../bookshelf');

require('./assessment');
require('./certification-challenge');
require('./session');

const modelName = 'CertificationCourse';

module.exports = Bookshelf.model(modelName, {

  tableName: 'certification-courses',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

  parse(rawAttributes) {
    if (rawAttributes.completedAt) {
      rawAttributes.completedAt = new Date(rawAttributes.completedAt);
    }

    return rawAttributes;
  },

  assessment() {
    return this.hasOne('Assessment', 'certificationCourseId');
  },

  challenges() {
    return this.hasMany('CertificationChallenge', 'courseId');
  },

  session() {
    return this.belongsTo('Session', 'sessionId');
  },

}, {
  modelName
});
