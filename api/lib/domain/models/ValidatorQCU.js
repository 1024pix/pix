const solutionServiceQCU = require('../services/solution-service-qcu');
const Validation = require('./Validation');
const Validator = require('./Validator');

/**
 * Traduction: Vérificateur de réponse pour un QCU
 */
class ValidatorQCU extends Validator {

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
    const result = solutionServiceQCU.match(answer.value, this.solution.value);

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

module.exports = ValidatorQCU;
