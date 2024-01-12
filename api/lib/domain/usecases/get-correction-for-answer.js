import { AssessmentNotCompletedError, NotFoundError } from '../errors.js';
import { LearningContentResourceNotFound } from '../../../src/shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { InternalServerError } from '../../application/http-errors.js';

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
  let response;
  try {
    response = await correctionRepository.getByChallengeId({
      challengeId: answer.challengeId,
      answerValue: answer.value,
      userId,
      locale,
    });
  } catch (error) {
    if (error instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw new InternalServerError();
  }

  return response;
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
