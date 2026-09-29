import { DomainError } from '../../shared/domain/errors.js';

class InvalidLtiPlatformRegistrationError extends DomainError {
  constructor(message = 'LTI platform registration is invalid', { cause } = {}) {
    super(message, 'INVALID_LTI_PLATFORM_REGISTRATION');
    this.cause = cause;
  }
}

export { InvalidLtiPlatformRegistrationError };
