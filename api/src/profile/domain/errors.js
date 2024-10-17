import { DomainError } from '../../shared/domain/errors.js';

class AttestationNotFoundError extends DomainError {
  constructor(message = 'Attestation does not exist') {
    super(message);
  }
}

export { AttestationNotFoundError };
