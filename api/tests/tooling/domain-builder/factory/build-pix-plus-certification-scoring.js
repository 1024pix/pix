import ComplementaryCertificationScoringWithComplementaryReferential from '../../../../lib/domain/models/ComplementaryCertificationScoringWithComplementaryReferential';
import buildReproducibilityRate from './build-reproducibility-rate';

export default function buildComplementaryCertificationScoringWithComplementaryReferential({
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
}
