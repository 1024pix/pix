import { CertificationScoringCompleted } from '../../../../lib/shared/domain/events/CertificationScoringCompleted.js';

const buildCertificationScoringCompletedEvent = function ({
  certificationCourseId = 123,
  userId = 456,
  reproducibilityRate = 55,
} = {}) {
  return new CertificationScoringCompleted({
    certificationCourseId,
    userId,
    reproducibilityRate,
  });
};

export { buildCertificationScoringCompletedEvent };
