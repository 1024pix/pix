import Validation from './Validation';
import Validator from './Validator';
import AnswerStatus from './AnswerStatus';

class ValidatorAlwaysOK extends Validator {
  assess() {
    return new Validation({
      result: AnswerStatus.OK,
      resultDetails: null,
    });
  }
}

export default ValidatorAlwaysOK;
