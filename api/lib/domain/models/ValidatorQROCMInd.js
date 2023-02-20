import solutionServiceQROCMInd from '../services/solution-service-qrocm-ind';
import Validation from './Validation';
import Validator from './Validator';

/**
 * Traduction: Vérificateur de réponse pour un QROCM Ind
 */
class ValidatorQROCMInd extends Validator {
  constructor({ solution } = {}) {
    super({ solution });
  }

  assess({ answer }) {
    const resultObject = solutionServiceQROCMInd.match({ answerValue: answer.value, solution: this.solution });

    return new Validation({
      result: resultObject.result,
      resultDetails: resultObject.resultDetails,
    });
  }
}

export default ValidatorQROCMInd;
