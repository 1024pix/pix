import { AssessmentSheet } from '../../../../../../src/certification/evaluation/domain/models/AssessmentSheet.js';

export const buildAssessmentSheet = function ({
  certificationCourseId = 1,
  assessmentId = 2,
  abortReason = null,
  maxReachableLevelOnCertificationDate = 5,
  isRejectedForFraud = false,
  answers = [],
} = {}) {
  return new AssessmentSheet({
    certificationCourseId,
    assessmentId,
    abortReason,
    maxReachableLevelOnCertificationDate,
    isRejectedForFraud,
    answers,
  });
};
