import solutionServiceQCM from '../services/solution-service-qcm';
import Validation from './Validation';
import Validator from './Validator';

/**
 * Traduction: Vérificateur de réponse pour un QCM
 */
class ValidatorQCM extends Validator {
  constructor({ solution } = {}) {
    super({ solution });
  }

  assess({ answer }) {
    const result = solutionServiceQCM.match(answer.value, this.solution.value);

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

export default ValidatorQCM;
