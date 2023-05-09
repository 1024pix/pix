import { CertificationRescoringCompleted } from '../../../../lib/domain/events/CertificationRescoringCompleted.js';

const buildCertificationRescoringCompletedEvent = function ({
  certificationCourseId = 123,
  userId = 456,
  reproducibilityRate = 55,
} = {}) {
  return new CertificationRescoringCompleted({
    certificationCourseId,
    userId,
    reproducibilityRate,
  });
};

export { buildCertificationRescoringCompletedEvent };
