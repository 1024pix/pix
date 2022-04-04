const logger = require('../../infrastructure/logger');
const Answer = require('./Answer');
const AnswerStatus = require('./AnswerStatus');

/**
 * Traduction: Correcteur
 */
class Examiner {
  constructor({ validator } = {}) {
    this.validator = validator;
  }

  evaluate({ answer, challengeFormat, isFocusedChallenge, isCertificationEvaluation }) {
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

    // Temporary log to find out focusedout answers that should not occur
    if (!isFocusedChallenge && answer.isFocusedOut) {
      logger.warn('A non focused challenge received a focused out answer', {
        answerId: answer.id,
      });
    }

    if (isCorrectAnswer && isFocusedChallenge && answer.isFocusedOut && isCertificationEvaluation) {
      correctedAnswer.result = AnswerStatus.FOCUSEDOUT;
    }

    return correctedAnswer;
  }
}

module.exports = Examiner;
