const Joi = require('@hapi/joi');

const { InvalidCertificationReportForFinalization } = require('../errors');
const { CertificationIssueReportCategories } = require('./CertificationIssueReportCategory');

const NO_EXAMINER_COMMENT = null;

const certificationReportSchemaForFinalization = Joi.object({
  id: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  certificationCourseId: Joi.number().required(),
  examinerComment: Joi.string().max(500).allow(null).optional(),
  certificationIssueReports: Joi.array().optional(),
  hasSeenEndTestScreen: Joi.boolean().required(),
});

class CertificationReport {
  constructor(
    {
      // attributes
      firstName,
      lastName,
      examinerComment,
      hasSeenEndTestScreen,
      certificationIssueReports,
      // references
      certificationCourseId,
    } = {}) {
    this.id = CertificationReport.idFromCertificationCourseId(certificationCourseId);
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.examinerComment = examinerComment;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.certificationIssueReports = certificationIssueReports,
    // references
    this.certificationCourseId = certificationCourseId;
  }

  validateForFinalization() {
    const { error } = certificationReportSchemaForFinalization.validate(this);
    if (error) {
      throw new InvalidCertificationReportForFinalization(error);
    }
  }

  static fromCertificationCourse(certificationCourse) {
    const formerExaminerComment = certificationCourse.certificationIssueReports.find(
      (certificationIssueReport) => certificationIssueReport.categoryId === CertificationIssueReportCategories.OTHER,
    );

    return new CertificationReport({
      certificationCourseId: certificationCourse.id,
      firstName: certificationCourse.firstName,
      lastName: certificationCourse.lastName,
      examinerComment: formerExaminerComment ? formerExaminerComment.description : null,
      certificationIssueReports: certificationCourse.certificationIssueReports,
      hasSeenEndTestScreen: certificationCourse.hasSeenEndTestScreen,
    });
  }

  static idFromCertificationCourseId(certificationCourseId) {
    return `CertificationReport:${certificationCourseId}`;
  }
}

module.exports = CertificationReport;
module.exports.NO_EXAMINER_COMMENT = NO_EXAMINER_COMMENT;
