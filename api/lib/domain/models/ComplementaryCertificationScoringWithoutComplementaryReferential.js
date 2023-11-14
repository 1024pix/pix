import { PartnerCertificationScoring } from './PartnerCertificationScoring.js';

class ComplementaryCertificationScoringWithoutComplementaryReferential extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    reproducibilityRate,
    pixScore,
    minimumEarnedPix,
    minimumReproducibilityRate,
  } = {}) {
    super({
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
    });

    this.reproducibilityRate = reproducibilityRate;
    this.pixScore = pixScore;
    this.minimumEarnedPix = minimumEarnedPix;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
  }

  isAcquired() {
    return this._isAboveMinimumReproducibilityRate() && this._isAboveMinimumScore();
  }

  _isAboveMinimumScore() {
    return this.pixScore >= this.minimumEarnedPix;
  }

  _isAboveMinimumReproducibilityRate() {
    return this.reproducibilityRate >= this.minimumReproducibilityRate;
  }
}

export { ComplementaryCertificationScoringWithoutComplementaryReferential };
