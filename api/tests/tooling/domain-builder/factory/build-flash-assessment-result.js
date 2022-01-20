const FlashAssessmentResult = require('../../../../lib/domain/models/FlashAssessmentResult');

module.exports = function buildFinalizedSession({
  id = 123,
  assessmentId = 123,
  estimatedLevel = 3.1340846745,
  errorRate = 0.31293904568,
} = {}) {
  return new FlashAssessmentResult({
    id,
    assessmentId,
    estimatedLevel,
    errorRate,
  });
};
