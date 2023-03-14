import * as solutionServiceQROC from '../services/solution-service-qroc.js';
import { Validation } from './Validation.js';
import { Validator } from './Validator.js';

/**
 * Traduction: Vérificateur de réponse pour un QROC
 */
class ValidatorQROC extends Validator {
  constructor({ solution } = {}) {
    super({ solution });
  }

  assess({ answer, challengeFormat }) {
    const result = solutionServiceQROC.match({ answer: answer.value, solution: this.solution, challengeFormat });

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

export { ValidatorQROC };
