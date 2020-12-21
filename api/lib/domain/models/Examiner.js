const Answer = require('./Answer');
const AnswerStatus = require('./AnswerStatus');

/**
 * Traduction: Correcteur
 */
class Examiner {

  constructor({
    validator,
  } = {}) {
    this.validator = validator;
  }

  evaluate({ answer, challengeFormat }) {

    const correctedAnswer = new Answer(answer);

    if (answer.value === Answer.FAKE_VALUE_FOR_SKIPPED_QUESTIONS) {
      correctedAnswer.result = AnswerStatus.SKIPPED;
      correctedAnswer.resultDetails = null;

      return correctedAnswer;
    }

    const answerValidation = this.validator.assess({ answer, challengeFormat });
    correctedAnswer.result = answerValidation.result;
    correctedAnswer.resultDetails = answerValidation.resultDetails;

    const isPartiallyOrCorrectAnswer = answerValidation.result.isOK() || answerValidation.result.isPARTIALLY();

    if (isPartiallyOrCorrectAnswer && answer.hasTimedOut) {
      correctedAnswer.result = AnswerStatus.TIMEDOUT;
    }

    return correctedAnswer;
  }
}

module.exports = Examiner;
