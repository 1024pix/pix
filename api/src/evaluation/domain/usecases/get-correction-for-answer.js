import {
  AssessmentNotCompletedError,
  LearningContentResourceNotFound,
  NotFoundError,
} from '../../../shared/domain/errors.js';

import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
import * as injectedAnswerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';

const getCorrectionForAnswer = async function ({
  assessmentRepository = injectedAssessmentRepository,
  answerRepository = injectedAnswerRepository,
  correctionRepository = injectedRepositories.correctionRepository,
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
    } else {
      throw error;
    }
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
