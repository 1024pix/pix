const PixPlusDroitCertificationScoring = require('../../../../lib/domain/models/PixPlusDroitCertificationScoring');
const { PIX_DROIT_MAITRE_CERTIF } = require('../../../../lib/domain/models/Badge').keys;
const buildReproducibilityRate = require('./build-reproducibility-rate');

module.exports = function buildPixPlusDroitCertificationScoring({
  certificationCourseId = 123,
  certifiableBadgeKey = PIX_DROIT_MAITRE_CERTIF,
  reproducibilityRate = buildReproducibilityRate({ value: 100 }),
  hasAcquiredPixCertification = true,
} = {}) {
  return new PixPlusDroitCertificationScoring({
    certificationCourseId,
    certifiableBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
  });
};
