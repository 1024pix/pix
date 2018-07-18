const Answer = require('./Answer');
const AnswerStatus = require('./AnswerStatus');
const _ = require('lodash');

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

    const isPartiallyOrCorrectAnswer = answerValidation.result.isOK() || answerValidation.result.isPARTIALLY();
    const hasTimedOut = _.isInteger(answer.timeout) && answer.timeout < 0;

    if (isPartiallyOrCorrectAnswer && hasTimedOut) {
      correctedAnswer.result = AnswerStatus.TIMEDOUT;
      correctedAnswer.resultDetails = answerValidation.resultDetails;

      return correctedAnswer;
    }

    correctedAnswer.result = answerValidation.result;
    correctedAnswer.resultDetails = answerValidation.resultDetails;

    return correctedAnswer;
  }
}

module.exports = Examiner;
