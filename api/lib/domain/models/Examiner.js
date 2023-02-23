const logger = require('../../infrastructure/logger.js');
const Answer = require('./Answer.js');
const AnswerStatus = require('./AnswerStatus.js');

/**
 * Traduction: Correcteur
 */
class Examiner {
  constructor({ validator } = {}) {
    this.validator = validator;
  }

  evaluate({ answer, challengeFormat, isFocusedChallenge, isCertificationEvaluation, hasLastQuestionBeenFocusedOut }) {
    const correctedAnswer = new Answer(answer);

    if (answer.value === Answer.FAKE_VALUE_FOR_SKIPPED_QUESTIONS) {
      correctedAnswer.result = AnswerStatus.SKIPPED;
      correctedAnswer.resultDetails = null;

      return correctedAnswer;
    }

    const answerValidation = this.validator.assess({ answer, challengeFormat });
    correctedAnswer.result = answerValidation.result;
    correctedAnswer.resultDetails = answerValidation.resultDetails;

    const isCorrectAnswer = answerValidation.result.isOK();

    if (isCorrectAnswer && answer.hasTimedOut) {
      correctedAnswer.result = AnswerStatus.TIMEDOUT;
    }

    // Temporary log to find out synchronization problems
    // between PATCH /focusedout and POST /answers
    if (
      (answer.isFocusedOut && !hasLastQuestionBeenFocusedOut) ||
      (!answer.isFocusedOut && hasLastQuestionBeenFocusedOut)
    ) {
      logger.warn(
        {
          subject: 'focusOut',
          challengeFormat,
          challengeId: answer.challengeId,
          assessmentId: answer.assessmentId,
        },
        `Received an answer whose isFocusedOut is %s whereas a %s focusedout event has already been received`,
        answer.isFocusedOut,
        hasLastQuestionBeenFocusedOut ? 'a' : 'no'
      );
    }

    // Consider user has focused out if at least one of the following is true :
    //   - assessment has recorded a focusedout event
    //   - answer.isFocusedOut is true
    answer.isFocusedOut = answer.isFocusedOut || hasLastQuestionBeenFocusedOut;

    // Temporary log to find out focusedout answers that should not occur
    if (!isFocusedChallenge && answer.isFocusedOut) {
      logger.warn(
        {
          subject: 'focusOut',
          challengeFormat,
          challengeId: answer.challengeId,
          assessmentId: answer.assessmentId,
        },
        'A non focused challenge received a focused out answer'
      );
    }

    if (isCorrectAnswer && isFocusedChallenge && answer.isFocusedOut && isCertificationEvaluation) {
      correctedAnswer.result = AnswerStatus.FOCUSEDOUT;
      correctedAnswer.isFocusedOut = true;
    }

    return correctedAnswer;
  }
}

module.exports = Examiner;
