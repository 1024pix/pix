const solutionServiceQCU = require('../services/solution-service-qcu.js');
const Validation = require('./Validation.js');
const Validator = require('./Validator.js');

/**
 * Traduction: Vérificateur de réponse pour un QCU
 */
class ValidatorQCU extends Validator {
  constructor({ solution, dependencies = { solutionServiceQCU } } = {}) {
    super({ solution });
    this.dependencies = dependencies;
  }

  assess({ answer }) {
    const result = this.dependencies.solutionServiceQCU.match(answer.value, this.solution.value);

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

module.exports = ValidatorQCU;
