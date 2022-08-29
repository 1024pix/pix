const ComplementaryCertificationScoringCriteria = require('../../../../lib/domain/models/ComplementaryCertificationScoringCriteria');

function buildComplementaryCertificationScoringCriteria({
  complementaryCertificationCourseId = 123,
  minimumReproducibilityRate = 70,
  complementaryCertificationBadgeKeys = [],
} = {}) {
  return new ComplementaryCertificationScoringCriteria({
    complementaryCertificationCourseId,
    minimumReproducibilityRate,
    complementaryCertificationBadgeKeys,
  });
}

module.exports = buildComplementaryCertificationScoringCriteria;
