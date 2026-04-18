import { ChallengeAlreadyAnsweredError, ChallengeNotAskedError } from '../../../shared/domain/errors.js';
import { EmptyAnswerError } from '../errors.js';

export async function saveAndCorrectAnswerForDemoAndPreview({
  answer,
  assessment,
  forceOKAnswer = false,
  answerRepository,
  challengeForCorrectionRepository,
  correctionService,
}) {
  if (assessment.answers.some((existingAnswer) => existingAnswer.challengeId === answer.challengeId)) {
    throw new ChallengeAlreadyAnsweredError();
  }
  if (assessment.lastChallengeId && assessment.lastChallengeId !== answer.challengeId) {
    throw new ChallengeNotAskedError();
  }
  if (!answer.hasValue && !answer.hasTimedOut) {
    throw new EmptyAnswerError();
  }

  const challenge = await challengeForCorrectionRepository.get(answer.challengeId);
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
