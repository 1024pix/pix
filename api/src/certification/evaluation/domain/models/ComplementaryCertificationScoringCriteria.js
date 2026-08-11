class ComplementaryCertificationScoringCriteria {
  constructor({
    complementaryCertificationCourseId,
    minimumReproducibilityRate,
    minimumReproducibilityRateLowerLevel,
    complementaryCertificationBadgeKey,
    complementaryCertificationBadgeId,
    minimumEarnedPix,
  } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
    this.minimumReproducibilityRateLowerLevel = minimumReproducibilityRateLowerLevel;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.complementaryCertificationBadgeKey = complementaryCertificationBadgeKey;
    this.minimumEarnedPix = minimumEarnedPix;
  }
}

export { ComplementaryCertificationScoringCriteria };
