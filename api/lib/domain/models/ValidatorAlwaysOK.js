const Validation = require('./Validation');
const Validator = require('./Validator');
const AnswerStatus = require('./AnswerStatus');

class ValidatorAlwaysOK extends Validator {
  assess() {
    return new Validation({
      result: AnswerStatus.OK,
      resultDetails: null,
    });
  }
}

module.exports = ValidatorAlwaysOK;
