import { DomainError } from '../../shared/domain/errors.js';

class InvalidLtiPlatformRegistrationError extends DomainError {
  constructor(message = 'LTI platform registration is invalid', { cause } = {}) {
    super(message, 'INVALID_LTI_PLATFORM_REGISTRATION');
    this.cause = cause;
  }
}

class LtiLineItemsInitializationError extends DomainError {
  constructor(message = 'Could not initialize LTI line items', { cause } = {}) {
    super(message, 'LTI_LINE_ITEMS_INITIALIZATION_ERROR');
    this.cause = cause;
  }
}

export { InvalidLtiPlatformRegistrationError, LtiLineItemsInitializationError };
