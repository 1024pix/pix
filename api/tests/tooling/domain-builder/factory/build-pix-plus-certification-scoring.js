import { ComplementaryCertificationScoringWithComplementaryReferential } from '../../../../lib/domain/models/ComplementaryCertificationScoringWithComplementaryReferential.js';
import { buildReproducibilityRate } from './build-reproducibility-rate.js';

const buildComplementaryCertificationScoringWithComplementaryReferential = function ({
  complementaryCertificationCourseId = 999,
  complementaryCertificationBadgeId = 100,
  complementaryCertificationBadgeKey = 'PIX_PLUS_TEST',
  reproducibilityRate = buildReproducibilityRate({ value: 100 }),
  hasAcquiredPixCertification = true,
  minimumReproducibilityRate = 70,
} = {}) {
  return new ComplementaryCertificationScoringWithComplementaryReferential({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    complementaryCertificationBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
    minimumReproducibilityRate,
  });
};

export { buildComplementaryCertificationScoringWithComplementaryReferential };
