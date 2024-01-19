import { V3CertificationCourseDetailsForAdministration } from '../../../../src/certification/course/domain/models/V3CertificationCourseDetailsForAdministration.js';

export const buildV3CertificationCourseDetailsForAdministration = ({
  certificationCourseId,
  isRejectedForFraud = false,
  isCancelled = false,
  certificationChallengesForAdministration = [],
  createdAt,
  completedAt,
  assessmentState,
  assessmentResultStatus,
  abortReason,
  pixScore,
}) => {
  return new V3CertificationCourseDetailsForAdministration({
    certificationCourseId,
    isRejectedForFraud,
    isCancelled,
    createdAt,
    completedAt,
    assessmentState,
    assessmentResultStatus,
    abortReason,
    pixScore,
    certificationChallengesForAdministration,
  });
};
