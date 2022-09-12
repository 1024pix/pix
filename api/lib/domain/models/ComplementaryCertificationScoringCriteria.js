class ComplementaryCertificationScoringCriteria {
  constructor({
    complementaryCertificationCourseId,
    minimumReproducibilityRate,
    complementaryCertificationBadgeKey,
    hasComplementaryReferential,
    minimumEarnedPix,
  } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
    this.complementaryCertificationBadgeKey = complementaryCertificationBadgeKey;
    this.hasComplementaryReferential = hasComplementaryReferential;
    this.minimumEarnedPix = minimumEarnedPix;
  }
}

module.exports = ComplementaryCertificationScoringCriteria;
