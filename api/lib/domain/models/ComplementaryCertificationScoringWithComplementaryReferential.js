import { ComplementaryCertificationCourseResult } from './ComplementaryCertificationCourseResult.js';
import { PartnerCertificationScoring } from './PartnerCertificationScoring.js';

class ComplementaryCertificationScoringWithComplementaryReferential extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    complementaryCertificationBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
    minimumReproducibilityRate,
  } = {}) {
    super({
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
      partnerKey: complementaryCertificationBadgeKey,
      source: ComplementaryCertificationCourseResult.sources.PIX,
    });

    this.reproducibilityRate = reproducibilityRate;
    this.hasAcquiredPixCertification = hasAcquiredPixCertification;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
  }

  isAcquired() {
    return this.hasAcquiredPixCertification && this.reproducibilityRate.isEqualOrAbove(this.minimumReproducibilityRate);
  }
}

export { ComplementaryCertificationScoringWithComplementaryReferential };
