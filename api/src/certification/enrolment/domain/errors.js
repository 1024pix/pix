import { DomainError } from '../../../shared/domain/errors.js';

class CertificationCandidateForbiddenDeletionError extends DomainError {
  constructor(message = 'Il est interdit de supprimer un candidat de certification déjà lié à un utilisateur.') {
    super(message);
  }
}

class SessionStartedDeletionError extends DomainError {
  constructor(message = 'La session a déjà commencé.') {
    super(message);
  }
}

export { CertificationCandidateForbiddenDeletionError, SessionStartedDeletionError };
