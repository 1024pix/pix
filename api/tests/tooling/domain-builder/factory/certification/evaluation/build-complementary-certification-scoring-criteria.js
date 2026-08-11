import { ComplementaryCertificationScoringCriteria } from '../../../../../../src/certification/evaluation/domain/models/ComplementaryCertificationScoringCriteria.js';

function buildComplementaryCertificationScoringCriteria({
  complementaryCertificationCourseId = 123,
  minimumReproducibilityRate = 70,
  minimumReproducibilityRateLowerLevel = 60,
  complementaryCertificationBadgeId = 89,
  complementaryCertificationBadgeKey = 'badge_key',
  minimumEarnedPix = 0,
} = {}) {
  return new ComplementaryCertificationScoringCriteria({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    minimumReproducibilityRate,
    minimumReproducibilityRateLowerLevel,
    complementaryCertificationBadgeKey,
    minimumEarnedPix,
  });
}

export { buildComplementaryCertificationScoringCriteria };
