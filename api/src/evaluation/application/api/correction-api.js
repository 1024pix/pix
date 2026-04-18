import * as correctionService from '../../domain/services/correction-service.js';

/**
 * @function
 * @name correctAnswer
 *
 * @param {Object} params
 * @param {ChallengeForCorrection} params.challenge
 * @param {Answer} params.answer
 * @param {boolean} params.challengeSubmittedAt
 * @param {boolean} params.hasChallengeBeenFocusedOut
 * @param {boolean} params.isCertificationEvaluation
 * @param {boolean} [params.accessibilityAdjustmentNeeded=false]
 * @param {boolean} [params.forceOKAnswer=false]
 * @returns {Answer} corrected answer
 */
export function correctAnswer({
  challenge,
  answer,
  hasChallengeBeenFocusedOut,
  challengeSubmittedAt,
  isCertificationEvaluation,
  accessibilityAdjustmentNeeded = false,
  forceOKAnswer = false,
}) {
  return correctionService.evaluateAnswer({
    challenge,
    answer,
    challengeSubmittedAt,
    hasChallengeBeenFocusedOut,
    isCertificationEvaluation,
    accessibilityAdjustmentNeeded,
    forceOKAnswer,
  });
}
