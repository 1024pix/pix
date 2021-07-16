const { DomainError } = require('./DomainError');

class ObjectValidationError extends DomainError {
  constructor(message = 'Erreur, objet non valide.') {
    super(message);
  }
}

module.exports = {
  ObjectValidationError,
};
