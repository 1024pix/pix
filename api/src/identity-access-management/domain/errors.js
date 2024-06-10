import { DomainError } from '../../shared/domain/errors.js';

class AuthenticationKeyExpired extends DomainError {
  constructor(message = 'This authentication key has expired.') {
    super(message);
  }
}

class DifferentExternalIdentifierError extends DomainError {
  constructor(
    message = "La valeur de l'externalIdentifier de la méthode de connexion ne correspond pas à celui reçu par le partenaire.",
  ) {
    super(message);
  }
}

class MissingOrInvalidCredentialsError extends DomainError {
  constructor(message = 'Missing or invalid credentials') {
    super(message);
  }
}

class MissingUserAccountError extends DomainError {
  constructor(message = 'Les informations de compte requises sont manquantes') {
    super(message);
  }
}

class PasswordNotMatching extends DomainError {
  constructor(message = 'Wrong password.') {
    super(message);
  }
}

class UserCantBeCreatedError extends DomainError {
  constructor(message = "L'utilisateur ne peut pas être créé") {
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
  DifferentExternalIdentifierError,
  MissingOrInvalidCredentialsError,
  MissingUserAccountError,
  PasswordNotMatching,
  UserCantBeCreatedError,
  UserShouldChangePasswordError,
};
