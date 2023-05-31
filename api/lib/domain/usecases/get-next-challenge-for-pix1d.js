import { NotFoundError } from '../errors.js';

export async function getNextChallengeForPix1d({
  assessmentId,
  assessmentRepository,
  answerRepository,
  challengeRepository,
}) {
  const { missionId } = await assessmentRepository.get(assessmentId);
  const answers = await answerRepository.findByAssessment(assessmentId);

  if (_userFailedOrSkippedLastChallenge(answers)) {
    assessmentRepository.completeByAssessmentId(assessmentId);
    throw new NotFoundError('No more challenge');
  }

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
}

const _userFailedOrSkippedLastChallenge = function (answers) {
  if (answers.length <= 0) {
    return false;
  }
  const lastAnswerResult = answers[answers.length - 1].result;
  return lastAnswerResult.isKO() || lastAnswerResult.isSKIPPED();
};
