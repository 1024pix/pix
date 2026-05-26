import { DomainError } from '../../shared/domain/errors.js';

class InvalidAuthenticationDataError extends DomainError {
  constructor(message = 'Invalid authenticationRequestedData') {
    super(message, 'INVALID_AUTHENTICATION_DATA');
  }
}

export { InvalidAuthenticationDataError };
