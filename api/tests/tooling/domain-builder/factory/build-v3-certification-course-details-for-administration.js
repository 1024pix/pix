import { V3CertificationCourseDetailsForAdministration } from '../../../../src/certification/session-management/domain/models/V3CertificationCourseDetailsForAdministration.js';

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
  numberOfChallenges,
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
    numberOfChallenges,
  });
};
