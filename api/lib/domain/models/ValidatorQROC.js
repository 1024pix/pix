const solutionServiceQROC = require('../services/solution-service-qroc');
const Validation = require('./Validation');
const Validator = require('./Validator');

/**
 * Traduction: Vérificateur de réponse pour un QROC
 */
class ValidatorQROC extends Validator {

  constructor({
    // attributes
    // includes
    solution,
    // references
  } = {}) {
    super();
    // attributes
    // includes
    this.solution = solution;
    // references
  }

  assess(answer) {
    const result = solutionServiceQROC.match(answer.value, this.solution.value, this.solution.deactivations);

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

module.exports = ValidatorQROC;
