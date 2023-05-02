const solutionServiceQROCMInd = require('../services/solution-service-qrocm-ind.js');
const Validation = require('./Validation.js');
const Validator = require('./Validator.js');

/**
 * Traduction: Vérificateur de réponse pour un QROCM Ind
 */
class ValidatorQROCMInd extends Validator {
  constructor({ solution, dependencies = { solutionServiceQROCMInd } } = {}) {
    super({ solution });
    this.dependencies = dependencies;
  }

  assess({ answer }) {
    const resultObject = this.dependencies.solutionServiceQROCMInd.match({
      answerValue: answer.value,
      solution: this.solution,
    });

    return new Validation({
      result: resultObject.result,
      resultDetails: resultObject.resultDetails,
    });
  }
}

module.exports = ValidatorQROCMInd;
