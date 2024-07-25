class ComplementaryCertificationScoringCriteria {
  constructor({
    complementaryCertificationCourseId,
    minimumReproducibilityRate,
    minimumReproducibilityRateLowerLevel,
    complementaryCertificationBadgeKey,
    complementaryCertificationBadgeId,
    hasComplementaryReferential,
    minimumEarnedPix,
  } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
    this.minimumReproducibilityRateLowerLevel = minimumReproducibilityRateLowerLevel;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.complementaryCertificationBadgeKey = complementaryCertificationBadgeKey;
    this.hasComplementaryReferential = hasComplementaryReferential;
    this.minimumEarnedPix = minimumEarnedPix;
  }
}

export { ComplementaryCertificationScoringCriteria };
