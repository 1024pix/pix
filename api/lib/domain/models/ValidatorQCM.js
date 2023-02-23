const solutionServiceQCM = require('../services/solution-service-qcm.js');
const Validation = require('./Validation.js');
const Validator = require('./Validator.js');

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

module.exports = ValidatorQCM;
