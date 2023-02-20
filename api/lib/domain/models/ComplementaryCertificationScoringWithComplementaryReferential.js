import ComplementaryCertificationCourseResult from './ComplementaryCertificationCourseResult';
import PartnerCertificationScoring from './PartnerCertificationScoring';

class ComplementaryCertificationScoringWithComplementaryReferential extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
    minimumReproducibilityRate,
  } = {}) {
    super({
      complementaryCertificationCourseId,
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

export default ComplementaryCertificationScoringWithComplementaryReferential;
