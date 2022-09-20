const ComplementaryCertificationScoringWithoutComplementaryReferential = require('../../../../lib/domain/models/ComplementaryCertificationScoringWithoutComplementaryReferential');

module.exports = function buildComplementaryCertificationScoringWithoutComplementaryReferential({
  complementaryCertificationCourseId = 99,
  certificationCourseId = 42,
  reproducibilityRate = 50,
  complementaryCertificationBadgeKey = 'badge_key',
  pixScore,
  minimumEarnedPix,
  minimumReproducibilityRate,
} = {}) {
  return new ComplementaryCertificationScoringWithoutComplementaryReferential({
    complementaryCertificationCourseId,
    certificationCourseId,
    reproducibilityRate,
    complementaryCertificationBadgeKey,
    pixScore,
    minimumEarnedPix,
    minimumReproducibilityRate,
  });
};
