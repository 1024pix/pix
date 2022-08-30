class ComplementaryCertificationScoringCriteria {
  constructor({
    complementaryCertificationCourseId,
    minimumReproducibilityRate,
    complementaryCertificationBadgeKeys,
  } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
    this.complementaryCertificationBadgeKeys = complementaryCertificationBadgeKeys;
  }
}

module.exports = ComplementaryCertificationScoringCriteria;
