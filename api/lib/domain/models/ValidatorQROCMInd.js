const solutionServiceQROCMInd = require('../services/solution-service-qrocm-ind');
const Validation = require('./Validation');
const Validator = require('./Validator');

/**
 * Traduction: Vérificateur de réponse pour un QROCM Ind
 */
class ValidatorQROCMInd extends Validator {

  constructor({
    // attributes
    // includes
    solution,
    // references
  } = {}) {
    super({ solution });
    // attributes
    // includes
    // references
  }

  assess({ answer }) {
    const resultObject = solutionServiceQROCMInd.match(answer.value, this.solution.value, this.solution.enabledTreatments);

    return new Validation({
      result: resultObject.result,
      resultDetails: resultObject.resultDetails,
    });
  }
}

module.exports = ValidatorQROCMInd;
