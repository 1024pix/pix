import { DomainError } from '../../shared/domain/errors.js';

class AuthenticationKeyExpired extends DomainError {
  constructor(message = 'This authentication key has expired.') {
    super(message);
  }
}

class MissingOrInvalidCredentialsError extends DomainError {
  constructor(message = 'Missing or invalid credentials') {
    super(message);
  }
}

class PasswordNotMatching extends DomainError {
  constructor(message = 'Wrong password.') {
    super(message);
  }
}

class UserShouldChangePasswordError extends DomainError {
  constructor(message = 'User password must be changed.', meta) {
    super(message);
    this.meta = meta;
  }
}

export {
  AuthenticationKeyExpired,
  MissingOrInvalidCredentialsError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
};
