import { ComplementaryCertificationScoringWithoutComplementaryReferential } from '../../../../lib/domain/models/ComplementaryCertificationScoringWithoutComplementaryReferential.js';

const buildComplementaryCertificationScoringWithoutComplementaryReferential = function ({
  complementaryCertificationCourseId = 99,
  complementaryCertificationBadgeId = 60,
  certificationCourseId = 42,
  reproducibilityRate = 50,
  complementaryCertificationBadgeKey = 'badge_key',
  pixScore,
  minimumEarnedPix,
  minimumReproducibilityRate,
} = {}) {
  return new ComplementaryCertificationScoringWithoutComplementaryReferential({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    certificationCourseId,
    reproducibilityRate,
    complementaryCertificationBadgeKey,
    pixScore,
    minimumEarnedPix,
    minimumReproducibilityRate,
  });
};

export { buildComplementaryCertificationScoringWithoutComplementaryReferential };
