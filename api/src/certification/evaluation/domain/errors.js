import { DomainError } from '../../../shared/domain/errors.js';

class CertificationComputeError extends DomainError {
  constructor(message = 'Erreur lors du calcul de la certification.') {
    super(message);
  }
}

class NextChallengeAlreadyComputingError extends DomainError {
  constructor() {
    super('Une nouvelle épreuve est en cours de calcul');
  }
}

class CertificationDurationExceededError extends DomainError {
  constructor(
    message = 'The maximum duration to answer the certification test has been exceeded.',
    code = 'CERTIFICATION_DURATION_EXCEEDED',
  ) {
    super(message, code);
  }
}

export { CertificationComputeError, CertificationDurationExceededError, NextChallengeAlreadyComputingError };
