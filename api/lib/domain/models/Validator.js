import AnswerStatus from './AnswerStatus';
import Validation from './Validation';

/**
 * Traduction: Vérificateur de réponse par défaut
 */
class Validator {
  constructor({ solution } = {}) {
    this.solution = solution;
  }

  assess() {
    return new Validation({
      result: AnswerStatus.UNIMPLEMENTED,
      resultDetails: null,
    });
  }
}

export default Validator;
