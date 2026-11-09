import { DomainError } from '../../shared/domain/errors.js';

export class InvalidLtiPlatformRegistrationError extends DomainError {
  constructor(message = 'LTI platform registration is invalid', { cause } = {}) {
    super(message, 'INVALID_LTI_PLATFORM_REGISTRATION');
    this.cause = cause;
  }
}

export class LtiLineItemsInitializationError extends DomainError {
  constructor(message = 'Could not initialize LTI line items', { cause } = {}) {
    super(message, 'LTI_LINE_ITEMS_INITIALIZATION_ERROR');
    this.cause = cause;
  }
}

export class AlreadyExistingLtiPlatformError extends DomainError {
  constructor(message = 'LTI platform with given issuer already exists', { cause } = {}) {
    super(message, 'ALREADY_EXISTING_LTI_PLATFORM');
    this.cause = cause;
  }
}
