const CleaCertification = require('./../../../../lib/domain/models/CleaCertification');
const buildCompetenceMark = require('./build-competence-mark');

module.exports = function buildCompetence({
  certificationCourseId = 42,
  hasAcquiredBadge = true,
  reproducibilityRate = 50,
  cleaCompetenceMarks = [buildCompetenceMark()],
  maxReachablePixByCompetenceForClea = { competence1: 51 }
} = {}) {

  return new CleaCertification({
    certificationCourseId,
    hasAcquiredBadge,
    reproducibilityRate,
    cleaCompetenceMarks,
    maxReachablePixByCompetenceForClea
  });
};
