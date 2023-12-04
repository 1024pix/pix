import { DomainError } from '../../../shared/domain/errors.js';

class SessionStartedDeletionError extends DomainError {
  constructor(message = 'La session a déjà commencé.') {
    super(message);
  }
}

class SessionAlreadyFinalizedError extends DomainError {
  constructor(message = 'Cannot finalize session more than once.') {
    super(message);
    this.code = 'SESSION_ALREADY_FINALIZED';
  }
}

class SessionWithoutStartedCertificationError extends DomainError {
  constructor(message = "This session hasn't started, you can't finalise it. However, you can delete it.") {
    super(message);
    this.code = 'SESSION_WITHOUT_STARTED_CERTIFICATION';
  }
}

class SessionWithAbortReasonOnCompletedCertificationCourseError extends DomainError {
  constructor(
    message = 'The field "Reason for abandonment" has been filled in for a candidate who has finished their certification exam in between. The session therefore can\'t be finalised. Please refresh the page before finalising.',
  ) {
    super(message);
    this.code = 'SESSION_WITH_ABORT_REASON_ON_COMPLETED_CERTIFICATION_COURSE';
  }
}

class SessionWithMissingAbortReasonError extends DomainError {
  constructor(
    message = "Une ou plusieurs certifications non terminées n'ont pas de “Raison de l’abandon” renseignées. La session ne peut donc pas être finalisée.",
  ) {
    super(message);
  }
}

class CertificationCandidateForbiddenDeletionError extends DomainError {
  constructor(message = 'Il est interdit de supprimer un candidat de certification déjà lié à un utilisateur.') {
    super(message);
  }
}

export {
  SessionStartedDeletionError,
  SessionWithMissingAbortReasonError,
  SessionWithoutStartedCertificationError,
  SessionWithAbortReasonOnCompletedCertificationCourseError,
  SessionAlreadyFinalizedError,
  CertificationCandidateForbiddenDeletionError,
};
