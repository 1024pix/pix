const solutionServiceQCM = require('../services/solution-service-qcm');
const Validation = require('./Validation');
const Validator = require('./Validator');

/**
 * Traduction: Vérificateur de réponse pour un QCM
 */
class ValidatorQCM extends Validator {

  constructor({
    solution,
  } = {}) {
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

module.exports = ValidatorQCM;
