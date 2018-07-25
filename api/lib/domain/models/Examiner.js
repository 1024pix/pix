const Answer = require('./Answer');
const AnswerStatus = require('./AnswerStatus');

/**
 * Traduction: Correcteur
 */
class Examiner {

  constructor({
    // attributes
    validator,
    // includes
    // references
  } = {}) {
    // attributes
    this.validator = validator;
    // includes
    // references
  }

  validate(answer) {

    const correctedAnswer = new Answer(answer);

    if (AnswerStatus.isSKIPPED(answer.value)) {
      correctedAnswer.result = AnswerStatus.SKIPPED;
      correctedAnswer.resultDetails = null;

      return correctedAnswer;
    }

    const answerValidation = this.validator.assess(answer);
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
