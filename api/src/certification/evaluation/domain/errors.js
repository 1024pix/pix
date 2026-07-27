import { DomainError } from '../../../shared/domain/errors.js';

export class CertificationComputeError extends DomainError {
  constructor(message = 'Erreur lors du calcul de la certification.') {
    super(message);
  }
}

export class NextChallengeAlreadyComputingError extends DomainError {
  constructor() {
    super('Une nouvelle épreuve est en cours de calcul');
  }
}

export class CertificationDurationExceededError extends DomainError {
  constructor(
    message = 'The maximum duration to answer the certification test has been exceeded.',
    code = 'CERTIFICATION_DURATION_EXCEEDED',
  ) {
    super(message, code);
  }
}

export class CandidateNotAuthorizedToJoinSessionError extends DomainError {
  constructor(
    message = 'Votre surveillant n’a pas confirmé votre présence dans la salle de test. Vous ne pouvez donc pas encore commencer votre test de certification. Merci de prévenir votre surveillant.',
    code = 'CANDIDATE_NOT_AUTHORIZED_TO_JOIN_SESSION',
  ) {
    super(message, code);
  }
}

export class CandidateNotAuthorizedToResumeCertificationTestError extends DomainError {
  constructor(
    message = "Merci de contacter votre surveillant afin qu'il autorise la reprise de votre test.",
    code = 'CANDIDATE_NOT_AUTHORIZED_TO_RESUME_SESSION',
  ) {
    super(message, code);
  }
}

export class SessionNotAccessibleError extends DomainError {
  constructor(message = 'Certification session is not accessible', code = 'SESSION_NOT_ACCESSIBLE') {
    super(message, code);
  }
}

export class CenterNotHabilitatedError extends DomainError {
  constructor(
    message = 'This certification center has no habilitation for the given complementary certification.',
    code = 'CENTER_HABILITATION_ERROR',
  ) {
    super(message, code);
  }
}
