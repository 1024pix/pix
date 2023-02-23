const Validation = require('./Validation.js');
const Validator = require('./Validator.js');
const AnswerStatus = require('./AnswerStatus.js');

class ValidatorAlwaysOK extends Validator {
  assess() {
    return new Validation({
      result: AnswerStatus.OK,
      resultDetails: null,
    });
  }
}

module.exports = ValidatorAlwaysOK;
