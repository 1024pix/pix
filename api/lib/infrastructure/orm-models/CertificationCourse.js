import Bookshelf from '../bookshelf';

import './Assessment';
import './CertificationChallenge';
import './CertificationIssueReport';
import './ComplementaryCertificationCourse';
import './Session';

const modelName = 'CertificationCourse';

export default Bookshelf.model(
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
