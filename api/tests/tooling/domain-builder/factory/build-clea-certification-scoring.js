const CleaCertificationScoring = require('./../../../../lib/domain/models/CleaCertificationScoring');

module.exports = function buildCleaCertificationScoring({
  complementaryCertificationCourseId = 99,
  certificationCourseId = 42,
  hasAcquiredBadge = true,
  isBadgeAcquisitionStillValid = true,
  reproducibilityRate = 50,
  cleaBadgeKey = 'some-clea_key',
  pixScore,
} = {}) {
  return new CleaCertificationScoring({
    complementaryCertificationCourseId,
    certificationCourseId,
    hasAcquiredBadge,
    isBadgeAcquisitionStillValid,
    reproducibilityRate,
    cleaBadgeKey,
    pixScore,
  });
};
