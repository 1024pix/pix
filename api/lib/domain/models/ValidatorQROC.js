const solutionServiceQROC = require('../services/solution-service-qroc.js');
const Validation = require('./Validation.js');
const Validator = require('./Validator.js');

/**
 * Traduction: Vérificateur de réponse pour un QROC
 */
class ValidatorQROC extends Validator {
  constructor({ solution } = {}) {
    super({ solution });
  }

  assess({ answer, challengeFormat }) {
    const result = solutionServiceQROC.match({ answer: answer.value, solution: this.solution, challengeFormat });

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

module.exports = ValidatorQROC;
