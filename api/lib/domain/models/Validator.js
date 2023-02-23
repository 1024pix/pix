const AnswerStatus = require('./AnswerStatus.js');
const Validation = require('./Validation.js');

/**
 * Traduction: Vérificateur de réponse par défaut
 */
class Validator {
  constructor({ solution } = {}) {
    this.solution = solution;
  }

  assess() {
    return new Validation({
      result: AnswerStatus.UNIMPLEMENTED,
      resultDetails: null,
    });
  }
}

module.exports = Validator;
