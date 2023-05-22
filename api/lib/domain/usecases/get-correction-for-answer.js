import { AssessmentNotCompletedError, NotFoundError } from '../errors.js';

const getCorrectionForAnswer = async function ({
  assessmentRepository,
  answerRepository,
  correctionRepository,
  answerId,
  userId,
  locale,
} = {}) {
  const integerAnswerId = parseInt(answerId);

  const answer = await answerRepository.get(integerAnswerId);
  const assessment = await assessmentRepository.get(answer.assessmentId);

  if (assessment.userId !== userId) {
    throw new NotFoundError(`Not found correction for answer of ID ${answerId}`);
  }

  _validateCorrectionIsAccessible(assessment);

  return correctionRepository.getByChallengeId({ challengeId: answer.challengeId, userId, locale });
};

export { getCorrectionForAnswer };

function _validateCorrectionIsAccessible(assessment) {
  if (assessment.isForCampaign() || assessment.isCompetenceEvaluation()) {
    return;
  }

  if (!assessment.isCompleted()) {
    throw new AssessmentNotCompletedError();
  }
}
