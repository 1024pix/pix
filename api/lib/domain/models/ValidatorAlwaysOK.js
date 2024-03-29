import { AnswerStatus } from '../../../src/shared/domain/models/AnswerStatus.js';
import { Validation } from './Validation.js';
import { Validator } from './Validator.js';

class ValidatorAlwaysOK extends Validator {
  assess() {
    return new Validation({
      result: AnswerStatus.OK,
      resultDetails: null,
    });
  }
}

export { ValidatorAlwaysOK };
