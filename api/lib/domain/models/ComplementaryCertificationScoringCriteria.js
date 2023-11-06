class ComplementaryCertificationScoringCriteria {
  constructor({
    complementaryCertificationCourseId,
    minimumReproducibilityRate,
    complementaryCertificationBadgeKey,
    complementaryCertificationBadgeId,
    hasComplementaryReferential,
    minimumEarnedPix,
  } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.complementaryCertificationBadgeKey = complementaryCertificationBadgeKey;
    this.hasComplementaryReferential = hasComplementaryReferential;
    this.minimumEarnedPix = minimumEarnedPix;
  }
}

export { ComplementaryCertificationScoringCriteria };
