const PixPlusCertificationScoring = require('../../../../lib/domain/models/PixPlusCertificationScoring');
const buildReproducibilityRate = require('./build-reproducibility-rate');

module.exports = function buildPixPlusCertificationScoring({
  certificationCourseId = 123,
  certifiableBadgeKey = 'PIX_FRUITS',
  reproducibilityRate = buildReproducibilityRate({ value: 100 }),
  hasAcquiredPixCertification = true,
} = {}) {
  return new PixPlusCertificationScoring({
    certificationCourseId,
    certifiableBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
  });
};
