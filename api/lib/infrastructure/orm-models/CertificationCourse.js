const Bookshelf = require('../bookshelf');

require('./Assessment');
require('./CertificationChallenge');
require('./CertificationIssueReport');
require('./ComplementaryCertificationCourse');
require('./Session');

const modelName = 'CertificationCourse';

module.exports = Bookshelf.model(
  modelName,
  {
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

    challenges() {
      return this.hasMany('CertificationChallenge', 'courseId');
    },

    session() {
      return this.belongsTo('Session', 'sessionId');
    },

    certificationIssueReports() {
      return this.hasMany('CertificationIssueReport', 'certificationCourseId');
    },

    complementaryCertificationCourses() {
      return this.hasMany('ComplementaryCertificationCourse', 'certificationCourseId');
    },
  },
  {
    modelName,
  }
);
