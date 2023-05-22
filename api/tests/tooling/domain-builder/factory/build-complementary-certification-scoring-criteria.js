import { ComplementaryCertificationScoringCriteria } from '../../../../lib/domain/models/ComplementaryCertificationScoringCriteria.js';

function buildComplementaryCertificationScoringCriteria({
  complementaryCertificationCourseId = 123,
  minimumReproducibilityRate = 70,
  complementaryCertificationBadgeKey = 'badge_key',
  hasComplementaryReferential = false,
  minimumEarnedPix = null,
} = {}) {
  return new ComplementaryCertificationScoringCriteria({
    complementaryCertificationCourseId,
    minimumReproducibilityRate,
    complementaryCertificationBadgeKey,
    hasComplementaryReferential,
    minimumEarnedPix,
  });
}

export { buildComplementaryCertificationScoringCriteria };
