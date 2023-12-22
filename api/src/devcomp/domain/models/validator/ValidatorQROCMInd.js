import * as solutionServiceQROCMInd from '../../services/solution-service-qrocm-ind.js';
import { Validation } from './Validation.js';
import { Validator } from './Validator.js';

/**
 * Traduction: Vérificateur de réponse pour un QROCM Ind
 */
class ValidatorQROCMInd extends Validator {
  constructor({ solution, dependencies = { solutionServiceQROCMInd } } = {}) {
    super({ solution });
    this.dependencies = dependencies;
  }

  assess({ answer }) {
    const resultObject = this.dependencies.solutionServiceQROCMInd.match({
      answerValue: answer.value,
      solution: this.solution,
    });

    return new Validation({
      result: resultObject.result,
      resultDetails: resultObject.resultDetails,
    });
  }
}

export { ValidatorQROCMInd };
