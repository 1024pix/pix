/* eslint-disable no-empty-pattern */
const AnswerStatus = require('./AnswerStatus');
const Validation = require('./Validation');

/**
 * Traduction: Vérificateur de réponse par défaut
 */
class Validator {

  constructor({
    // attributes
    // includes
    // references
  } = {}) {
    // attributes
    // includes
    // references
  }

  assess() {
    return new Validation({
      result: AnswerStatus.UNIMPLEMENTED,
      resultDetails: null,
    });
  }
}

module.exports = Validator;
