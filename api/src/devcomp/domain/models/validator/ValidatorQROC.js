import * as solutionServiceQROC from '../../services/solution-service-qroc.js';
import { Validation } from './Validation.js';
import { Validator } from './Validator.js';

/**
 * Traduction: Vérificateur de réponse pour un QROC
 */
class ValidatorQROC extends Validator {
  injectedSolutionServiceQROC;
  constructor({ solutions } = {}, injectedSolutionServiceQROC = solutionServiceQROC) {
    super({ solution: solutions });
    this.injectedSolutionServiceQROC = injectedSolutionServiceQROC;
  }

  assess({ answer, challengeFormat }) {
    const result = this.injectedSolutionServiceQROC.match({
      answer: answer.value,
      solutions: this.solution,
      challengeFormat,
    });

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

export { ValidatorQROC };
