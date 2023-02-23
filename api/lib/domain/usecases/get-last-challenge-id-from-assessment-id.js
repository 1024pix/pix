const { NotFoundError } = require('../errors.js');

module.exports = async function getLastChallengeIdFromAssessmentId({ assessmentId, assessmentRepository }) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }

  return assessment.lastChallengeId;
};
