class ComplementaryCertificationScoringCriteria {
  constructor({
    complementaryCertificationCourseId,
    minimumReproducibilityRate,
    complementaryCertificationBadgeKeys,
    hasComplementaryReferential,
    minimumEarnedPix,
  } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
    this.complementaryCertificationBadgeKeys = complementaryCertificationBadgeKeys;
    this.hasComplementaryReferential = hasComplementaryReferential;
    this.minimumEarnedPix = minimumEarnedPix;
  }
}

module.exports = ComplementaryCertificationScoringCriteria;
