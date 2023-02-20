import solutionServiceQROC from '../services/solution-service-qroc';
import Validation from './Validation';
import Validator from './Validator';

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

export default ValidatorQROC;
