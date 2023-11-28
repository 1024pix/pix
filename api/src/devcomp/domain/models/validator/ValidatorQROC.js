import * as solutionServiceQROC from '../../services/solution-service-qroc.js';
import { Validation } from './Validation.js';
import { Validator } from './Validator.js';

/**
 * Traduction: Vérificateur de réponse pour un QROC
 */
class ValidatorQROC extends Validator {
  injectedSolutionServiceQROC;
  constructor({ solution } = {}, injectedSolutionServiceQROC = solutionServiceQROC) {
    super({ solution });
    this.injectedSolutionServiceQROC = injectedSolutionServiceQROC;
  }

  assess({ answer, challengeFormat }) {
    const result = this.injectedSolutionServiceQROC.match({
      answer: answer.value,
      solution: this.solution,
      challengeFormat,
    });

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

export { ValidatorQROC };
