import { ComplementaryCertificationCourseResult } from '../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { PartnerCertificationScoring } from './PartnerCertificationScoring.js';

class ComplementaryCertificationScoringWithComplementaryReferential extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    reproducibilityRate,
    hasAcquiredPixCertification,
    minimumReproducibilityRate,
    isRejectedForFraud,
    pixScore,
    minimumEarnedPix,
  } = {}) {
    super({
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
      source: ComplementaryCertificationCourseResult.sources.PIX,
      isRejectedForFraud,
      hasAcquiredPixCertification,
    });

    this.pixScore = pixScore;
    this.minimumEarnedPix = minimumEarnedPix;
    this.reproducibilityRate = reproducibilityRate;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
  }

  isAcquired() {
    return (
      !this.isRejectedForFraud &&
      this.hasAcquiredPixCertification &&
      this.reproducibilityRate.isEqualOrAbove(this.minimumReproducibilityRate) &&
      this.pixScore >= this.minimumEarnedPix
    );
  }
}

export { ComplementaryCertificationScoringWithComplementaryReferential };
