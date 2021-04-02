const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');

const buildCertificationScoringCompletedEvent = function({
  certificationCourseId = 123,
  userId = 456,
  reproducibilityRate = 55,
  isValidated = true,
} = {}) {
  return new CertificationScoringCompleted({
    certificationCourseId,
    userId,
    reproducibilityRate,
    isValidated,
  });
};

buildCertificationScoringCompletedEvent.validated = function({
  certificationCourseId,
  userId,
  reproducibilityRate,
} = {}) {
  return buildCertificationScoringCompletedEvent({
    certificationCourseId,
    userId,
    reproducibilityRate,
    isValidated: true,
  });
};

buildCertificationScoringCompletedEvent.rejected = function({
  certificationCourseId,
  userId,
  reproducibilityRate,
} = {}) {
  return buildCertificationScoringCompletedEvent({
    certificationCourseId,
    userId,
    reproducibilityRate,
    isValidated: false,
  });
};

module.exports = buildCertificationScoringCompletedEvent;
