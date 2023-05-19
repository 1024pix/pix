const { NotFoundError } = require('../errors');
module.exports = async function getNextChallengeForPix1d({
  assessmentId,
  assessmentRepository,
  answerRepository,
  challengeRepository,
}) {
  const { missionId } = await assessmentRepository.get(assessmentId);
  const answers = await answerRepository.findByAssessment(assessmentId);
  const challengeNumber = answers.length + 1;

  try {
    return await challengeRepository.getForPix1D({
      missionId,
      activityLevel: 'didacticiel',
      challengeNumber,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      assessmentRepository.completeByAssessmentId(assessmentId);
    }
    throw error;
  }
};
