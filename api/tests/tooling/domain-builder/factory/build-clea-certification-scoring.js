const CleaCertificationScoring = require('./../../../../lib/domain/models/CleaCertificationScoring');
const buildCompetenceMark = require('./build-competence-mark');

module.exports = function buildCleaCertificationScoring({
  certificationCourseId = 42,
  hasAcquiredBadge = true,
  reproducibilityRate = 50,
  cleaCompetenceMarks = [buildCompetenceMark()],
  maxReachablePixByCompetenceForClea = { competence1: 51 },
} = {}) {

  return new CleaCertificationScoring({
    certificationCourseId,
    hasAcquiredBadge,
    reproducibilityRate,
    cleaCompetenceMarks,
    maxReachablePixByCompetenceForClea,
  });
};
