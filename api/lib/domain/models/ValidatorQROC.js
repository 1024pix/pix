const solutionServiceQROC = require('../services/solution-service-qroc');
const Validation = require('./Validation');
const Validator = require('./Validator');

/**
 * Traduction: Vérificateur de réponse pour un QROC
 */
class ValidatorQROC extends Validator {

  constructor({
    solution,
  } = {}) {
    super({ solution });
  }

  assess({ answer, challengeFormat }) {
    const result = solutionServiceQROC.match({ answer: answer.value, solution: this.solution.value, deactivations: this.solution.deactivations, challengeFormat });

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

module.exports = ValidatorQROC;
