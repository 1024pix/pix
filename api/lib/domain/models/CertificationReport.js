import _ from 'lodash';
import Joi from 'joi';

import { InvalidCertificationReportForFinalization } from '../errors.js';

const NO_EXAMINER_COMMENT = null;

const certificationReportSchemaForFinalization = Joi.object({
  id: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  certificationCourseId: Joi.number().required(),
  examinerComment: Joi.string().max(500).allow(null).optional(),
  certificationIssueReports: Joi.array().required(),
  hasSeenEndTestScreen: Joi.boolean().required(),
  isCompleted: Joi.boolean().required(),
  abortReason: Joi.string().allow(null),
});

class CertificationReport {
  constructor({
    firstName,
    lastName,
    examinerComment,
    hasSeenEndTestScreen,
    certificationIssueReports = [],
    certificationCourseId,
    isCompleted,
    abortReason,
  } = {}) {
    this.id = CertificationReport.idFromCertificationCourseId(certificationCourseId);
    this.firstName = firstName;
    this.lastName = lastName;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.certificationIssueReports = certificationIssueReports;
    this.certificationCourseId = certificationCourseId;
    this.isCompleted = isCompleted;
    this.examinerComment = examinerComment;
    if (_.isEmpty(_.trim(this.examinerComment))) {
      this.examinerComment = NO_EXAMINER_COMMENT;
    }
    this.abortReason = abortReason;
  }

  validateForFinalization() {
    const { error } = certificationReportSchemaForFinalization.validate(this);

    if (error) {
      throw new InvalidCertificationReportForFinalization(error);
    }

    if (!this.isCompleted && !this.abortReason) {
      throw new InvalidCertificationReportForFinalization(
        'Abort reason is required if certificationReport is not completed',
      );
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
      isCompleted: certificationCourseDTO.assessment.isCompleted(),
      abortReason: certificationCourseDTO.abortReason,
    });
  }

  static idFromCertificationCourseId(certificationCourseId) {
    return `CertificationReport-${certificationCourseId}`;
  }
}

CertificationReport.NO_EXAMINER_COMMENT = NO_EXAMINER_COMMENT;

export { CertificationReport, NO_EXAMINER_COMMENT };
