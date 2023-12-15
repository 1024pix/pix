import { ComplementaryCertificationScoringWithComplementaryReferential } from '../../../../lib/domain/models/ComplementaryCertificationScoringWithComplementaryReferential.js';
import { buildReproducibilityRate } from './build-reproducibility-rate.js';

const buildComplementaryCertificationScoringWithComplementaryReferential = function ({
  complementaryCertificationCourseId = 999,
  complementaryCertificationBadgeId = 100,
  reproducibilityRate = buildReproducibilityRate({ value: 100 }),
  hasAcquiredPixCertification = true,
  minimumReproducibilityRate = 70,
} = {}) {
  return new ComplementaryCertificationScoringWithComplementaryReferential({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    reproducibilityRate,
    hasAcquiredPixCertification,
    minimumReproducibilityRate,
  });
};

export { buildComplementaryCertificationScoringWithComplementaryReferential };
