const { NotFoundError } = require('../errors');
const { MAX_REACHABLE_LEVEL } = require('../../../lib/domain/models/Profile');

module.exports = async function getAssessment(
  {
    // arguments
    assessmentId,
    // dependencies
    assessmentRepository,
  }) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }
  const assessmentResult = assessment.getLastAssessmentResult();

  if(assessmentResult) {
    assessment.estimatedLevel = Math.min(assessmentResult.level, MAX_REACHABLE_LEVEL);
    assessment.pixScore = assessmentResult.pixScore;
  } else {
    assessment.estimatedLevel = null;
    assessment.pixScore = null;
  }

  return assessment;
};
