const Joi = require('@hapi/joi');

const { InvalidCertificationReportForFinalization } = require('../errors');

const NO_EXAMINER_COMMENT = null;

const certificationReportSchemaForFinalization = Joi.object({
  id: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  certificationCourseId: Joi.number().required(),
  examinerComment: Joi.string().max(500).allow(null).optional(),
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
      // references
      certificationCourseId,
    } = {}) {
    this.id = CertificationReport.idFromCertificationCourseId(certificationCourseId);
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.examinerComment = examinerComment;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
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
    return new CertificationReport({
      certificationCourseId: certificationCourse.id,
      firstName: certificationCourse.firstName,
      lastName: certificationCourse.lastName,
      examinerComment: certificationCourse.examinerComment,
      hasSeenEndTestScreen: certificationCourse.hasSeenEndTestScreen,
    });
  }

  static idFromCertificationCourseId(certificationCourseId) {
    return `CertificationReport:${certificationCourseId}`;
  }
}

module.exports = {
  CertificationReport,
  NO_EXAMINER_COMMENT,
};
