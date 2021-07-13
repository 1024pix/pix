const _ = require('lodash');
const Joi = require('joi');

const { InvalidCertificationReportForFinalization } = require('../errors');

const NO_EXAMINER_COMMENT = null;

const certificationReportSchemaForFinalization = Joi.object({
  id: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  certificationCourseId: Joi.number().required(),
  examinerComment: Joi.string().max(500).allow(null).optional(),
  certificationIssueReports: Joi.array().required(),
  hasSeenEndTestScreen: Joi.boolean().required(),
});

class CertificationReport {
  constructor(
    {
      firstName,
      lastName,
      examinerComment,
      hasSeenEndTestScreen,
      certificationIssueReports = [],
      certificationCourseId,
    } = {}) {
    this.id = CertificationReport.idFromCertificationCourseId(certificationCourseId);
    this.firstName = firstName;
    this.lastName = lastName;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.certificationIssueReports = certificationIssueReports;
    this.certificationCourseId = certificationCourseId;
    this.examinerComment = examinerComment;
    if (_.isEmpty(_.trim(this.examinerComment))) {
      this.examinerComment = NO_EXAMINER_COMMENT;
    }
  }

  validateForFinalization() {
    const { error } = certificationReportSchemaForFinalization.validate(this);
    if (error) {
      throw new InvalidCertificationReportForFinalization(error);
    }
  }

  static fromCertificationCourse(certificationCourse) {
    const certificationCourseDTO = certificationCourse.toDTO();
    return new CertificationReport({
      certificationCourseId: certificationCourseDTO.id,
      firstName: certificationCourseDTO.firstName,
      lastName: certificationCourseDTO.lastName,
      certificationIssueReports: certificationCourseDTO.certificationIssueReports,
      hasSeenEndTestScreen: certificationCourseDTO.hasSeenEndTestScreen,
    });
  }

  static idFromCertificationCourseId(certificationCourseId) {
    return `CertificationReport:${certificationCourseId}`;
  }
}

module.exports = CertificationReport;
module.exports.NO_EXAMINER_COMMENT = NO_EXAMINER_COMMENT;
