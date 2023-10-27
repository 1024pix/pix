import { AnswerStatus } from './AnswerStatus.js';
import { Validation } from './Validation.js';

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

export { Validator };
