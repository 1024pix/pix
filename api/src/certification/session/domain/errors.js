import { DomainError } from '../../../shared/domain/errors.js';

class SessionStartedDeletionError extends DomainError {
  constructor(message = 'La session a déjà commencé.') {
    super(message);
  }
}

export { SessionStartedDeletionError };
