const ComplementaryCertificationScoringWithComplementaryReferential = require('../../../../lib/domain/models/ComplementaryCertificationScoringWithComplementaryReferential');
const buildReproducibilityRate = require('./build-reproducibility-rate');

module.exports = function buildComplementaryCertificationScoringWithComplementaryReferential({
  complementaryCertificationCourseId = 999,
  complementaryCertificationBadgeKey = 'PIX_PLUS_TEST',
  reproducibilityRate = buildReproducibilityRate({ value: 100 }),
  hasAcquiredPixCertification = true,
  minimumReproducibilityRate = 70,
} = {}) {
  return new ComplementaryCertificationScoringWithComplementaryReferential({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
    minimumReproducibilityRate,
  });
};
