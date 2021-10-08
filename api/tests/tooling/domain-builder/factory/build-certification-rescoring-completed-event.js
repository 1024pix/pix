const CertificationRescoringCompleted = require('../../../../lib/domain/events/CertificationRescoringCompleted');

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

module.exports = buildCertificationRescoringCompletedEvent;
