const { NotFoundError } = require('../errors.js');

module.exports = async function getChallengeForPixAutoAnswer({
  assessmentId,
  assessmentRepository,
  challengeForPixAutoAnswerRepository,
}) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }

  const lastChallengeId = assessment.lastChallengeId;
  return challengeForPixAutoAnswerRepository.get(lastChallengeId);
};
