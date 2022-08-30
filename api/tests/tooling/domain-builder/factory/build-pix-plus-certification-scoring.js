const PixPlusCertificationScoring = require('../../../../lib/domain/models/PixPlusCertificationScoring');
const buildReproducibilityRate = require('./build-reproducibility-rate');

module.exports = function buildPixPlusCertificationScoring({
  complementaryCertificationCourseId = 999,
  certifiableBadgeKey = 'PIX_PLUS_TEST',
  reproducibilityRate = buildReproducibilityRate({ value: 100 }),
  hasAcquiredPixCertification = true,
  minimumReproducibilityRate = 70,
} = {}) {
  return new PixPlusCertificationScoring({
    complementaryCertificationCourseId,
    certifiableBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
    minimumReproducibilityRate,
  });
};
