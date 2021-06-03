const { NotFoundError } = require('../errors');

module.exports = async function getChallengeSolutionForPixButton({
  assessmentId,
  assessmentRepository,
  challengeRepository,
}) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }

  const lastChallengeId = assessment.lastChallengeId;
  return challengeRepository.getSolution(lastChallengeId);
};
