import { Bookshelf } from '../bookshelf.js';

import './Assessment.js';
import './CertificationChallenge.js';
import './CertificationIssueReport.js';
import './ComplementaryCertificationCourse.js';
import './Session.js';

const modelName = 'CertificationCourse';

const BookshelfCertificationCourse = Bookshelf.model(
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

export { BookshelfCertificationCourse };
