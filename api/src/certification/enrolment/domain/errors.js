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

class CertificationCandidateNotFoundError extends DomainError {
  constructor(message = 'Certification candidate not found') {
    super(message);
  }
}

export {
  CertificationCandidateForbiddenDeletionError,
  CertificationCandidateNotFoundError,
  SessionStartedDeletionError,
};
