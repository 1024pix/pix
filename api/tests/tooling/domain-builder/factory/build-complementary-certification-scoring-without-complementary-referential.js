import { ComplementaryCertificationScoringWithoutComplementaryReferential } from '../../../../lib/domain/models/ComplementaryCertificationScoringWithoutComplementaryReferential.js';

const buildComplementaryCertificationScoringWithoutComplementaryReferential = function ({
  complementaryCertificationCourseId = 99,
  complementaryCertificationBadgeId = 60,
  certificationCourseId = 42,
  reproducibilityRate = 50,
  pixScore,
  minimumEarnedPix,
  minimumReproducibilityRate,
  hasAcquiredPixCertification = true,
} = {}) {
  return new ComplementaryCertificationScoringWithoutComplementaryReferential({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    certificationCourseId,
    reproducibilityRate,
    pixScore,
    minimumEarnedPix,
    minimumReproducibilityRate,
    hasAcquiredPixCertification,
  });
};

export { buildComplementaryCertificationScoringWithoutComplementaryReferential };
