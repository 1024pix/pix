const PixPlusCertification = require('../../../../lib/domain/models/PixPlusCertification');
const buildReproducibilityRate = require('./build-reproducibility-rate');

module.exports = function buildPixPlusCertification({
  certificationCourseId = 123,
  certifiableBadgeKey = 'PIX_FRUITS',
  reproducibilityRate = buildReproducibilityRate({ value: 100 }),
  hasAcquiredPixCertification = true,
} = {}) {
  return new PixPlusCertification({
    certificationCourseId,
    certifiableBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
  });
};
