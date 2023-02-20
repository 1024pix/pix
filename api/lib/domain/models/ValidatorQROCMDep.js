import solutionServiceQROCMDep from '../services/solution-service-qrocm-dep';
import Validation from './Validation';
import Validator from './Validator';

/**
 * Traduction: Vérificateur de réponse pour un QROCM Dep
 */
class ValidatorQROCMDep extends Validator {
  constructor({ solution } = {}) {
    super({ solution });
  }

  assess({ answer }) {
    const result = solutionServiceQROCMDep.match({
      answerValue: answer.value,
      solution: this.solution,
    });

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

export default ValidatorQROCMDep;
