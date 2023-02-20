import CertificationScoringCompleted from '../../../../lib/domain/events/CertificationScoringCompleted';

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

export default buildCertificationScoringCompletedEvent;
