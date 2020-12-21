const AnswerStatus = require('./AnswerStatus');
const Validation = require('./Validation');

/**
 * Traduction: Vérificateur de réponse par défaut
 */
class Validator {

  constructor({
    solution,
  } = {}) {
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
