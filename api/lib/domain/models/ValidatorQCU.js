import solutionServiceQCU from '../services/solution-service-qcu';
import Validation from './Validation';
import Validator from './Validator';

/**
 * Traduction: Vérificateur de réponse pour un QCU
 */
class ValidatorQCU extends Validator {
  constructor({ solution } = {}) {
    super({ solution });
  }

  assess({ answer }) {
    const result = solutionServiceQCU.match(answer.value, this.solution.value);

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

export default ValidatorQCU;
