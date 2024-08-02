import { AnswerStatus } from '../../../shared/domain/models/AnswerStatus.js';
import { Validation } from '../../../shared/domain/models/Validation.js';
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
