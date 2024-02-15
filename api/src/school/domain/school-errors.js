import { DomainError } from '../../../lib/domain/errors.js';

class ActivityNotFoundError extends DomainError {
  constructor(message = 'Erreur, activitée introuvable.', code) {
    super(message);
    this.code = code;
  }
}

class SchoolNotFoundError extends DomainError {
  constructor(message = 'Erreur, École introuvable.', code) {
    super(message);
    this.code = code;
  }
}

export { ActivityNotFoundError, SchoolNotFoundError };
