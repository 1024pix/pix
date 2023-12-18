import { ComplementaryCertificationCourseResult } from './ComplementaryCertificationCourseResult.js';
import { PartnerCertificationScoring } from './PartnerCertificationScoring.js';

class ComplementaryCertificationScoringWithComplementaryReferential extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    reproducibilityRate,
    hasAcquiredPixCertification,
    minimumReproducibilityRate,
    isRejectedForFraud,
  } = {}) {
    super({
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
      source: ComplementaryCertificationCourseResult.sources.PIX,
      isRejectedForFraud,
    });

    this.reproducibilityRate = reproducibilityRate;
    this.hasAcquiredPixCertification = hasAcquiredPixCertification;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
  }

  isAcquired() {
    return (
      !this.isRejectedForFraud &&
      this.hasAcquiredPixCertification &&
      this.reproducibilityRate.isEqualOrAbove(this.minimumReproducibilityRate)
    );
  }
}

export { ComplementaryCertificationScoringWithComplementaryReferential };
