import {
  ChallengeAlreadyAnsweredError,
  ChallengeNotAskedError,
  EmptyAnswerError,
} from '../../../shared/domain/errors.js';
import { AssessmentAlreadyEndedError } from '../errors.js';

export async function saveAndCorrectAnswerForDemoAndPreview({
  answer,
  assessment,
  forceOKAnswer = false,
  answerRepository,
  challengeRepository,
  correctionService,
}) {
  if (!assessment.isStarted()) {
    throw new AssessmentAlreadyEndedError();
  }
  if (assessment.answers.some((existingAnswer) => existingAnswer.challengeId === answer.challengeId)) {
    throw new ChallengeAlreadyAnsweredError();
  }
  if (assessment.lastChallengeId && assessment.lastChallengeId !== answer.challengeId) {
    throw new ChallengeNotAskedError();
  }
  if (answer.isEmpty) {
    throw new EmptyAnswerError();
  }

  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = correctionService.evaluateAnswer({
    challenge,
    answer,
    challengeSubmittedAt: assessment.lastQuestionDate,
    hasChallengeBeenFocusedOut: assessment.hasLastQuestionBeenFocusedOut,
    isCertificationEvaluation: false,
    accessibilityAdjustmentNeeded: false,
    forceOKAnswer,
  });

  const answerSaved = await answerRepository.save({ answer: correctedAnswer });
  answerSaved.levelup = {};
  return answerSaved;
}
