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

class UnknownCountryForStudentEnrolmentError extends DomainError {
  constructor(
    { firstName, lastName },
    message = `L'élève ${firstName} ${lastName} a été inscrit avec un code pays de naissance invalide. Veuillez corriger ses informations sur l'espace PixOrga de l'établissement ou contacter le support Pix`,
  ) {
    super(message);
  }
}

export {
  CertificationCandidateForbiddenDeletionError,
  CertificationCandidateNotFoundError,
  SessionStartedDeletionError,
  UnknownCountryForStudentEnrolmentError,
};
