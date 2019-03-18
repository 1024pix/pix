const { NotFoundError } = require('../errors');

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
    assessment.estimatedLevel = assessmentResult.level;
    assessment.pixScore = assessmentResult.pixScore;
  } else {
    assessment.estimatedLevel = null;
    assessment.pixScore = null;
  }

  return assessment;
};
