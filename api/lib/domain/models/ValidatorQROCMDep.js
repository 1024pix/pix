const solutionServiceQROCMInd = require('../services/solution-service-qrocm-dep');
const Validation = require('./Validation');
const Validator = require('./Validator');

/**
 * Traduction: Vérificateur de réponse pour un QROCM Dep
 */
class ValidatorQROCMDep extends Validator {

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

  assess(answer) {
    const result = solutionServiceQROCMInd.match(answer.value, this.solution.value, this.solution.deactivations);

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

module.exports = ValidatorQROCMDep;
