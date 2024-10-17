import { DomainError } from '../../shared/domain/errors.js';

class AttestationNotFoundError extends DomainError {
  constructor(message = 'Attestation does not exist') {
    super(message);
  }
}

class RewardTypeDoesNotExistError extends DomainError {
  constructor(message = 'Reward Type does not exist') {
    super(message);
  }
}

export { AttestationNotFoundError, RewardTypeDoesNotExistError };
