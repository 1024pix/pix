import { Validation } from './Validation.js';
import { Validator } from './Validator.js';
import { AnswerStatus } from './AnswerStatus.js';

class ValidatorAlwaysOK extends Validator {
  assess() {
    return new Validation({
      result: AnswerStatus.OK,
      resultDetails: null,
    });
  }
}

export { ValidatorAlwaysOK };
