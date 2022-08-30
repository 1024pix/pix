const ComplementaryCertificationScoringCriteria = require('../../../../lib/domain/models/ComplementaryCertificationScoringCriteria');

function buildComplementaryCertificationScoringCriteria({
  complementaryCertificationCourseId = 123,
  minimumReproducibilityRate = 70,
  complementaryCertificationBadgeKeys = [],
  hasComplementaryReferential = false,
  minimumEarnedPix = null,
} = {}) {
  return new ComplementaryCertificationScoringCriteria({
    complementaryCertificationCourseId,
    minimumReproducibilityRate,
    complementaryCertificationBadgeKeys,
    hasComplementaryReferential,
    minimumEarnedPix,
  });
}

module.exports = buildComplementaryCertificationScoringCriteria;
