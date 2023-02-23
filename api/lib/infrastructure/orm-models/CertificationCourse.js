const Bookshelf = require('../bookshelf.js');

require('./Assessment.js');
require('./CertificationChallenge.js');
require('./CertificationIssueReport.js');
require('./ComplementaryCertificationCourse.js');
require('./Session.js');

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
