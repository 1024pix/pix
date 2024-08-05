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

class OrganizationLearnerDoesAlreadyHaveAnUsernameError extends DomainError {
  constructor(message = "L'élève a déjà un identitfiant.", code = 'ORGANIZATION_LEARNER_DOES_ALREADY_HAVE_A_USERNAME') {
    super(message, code);
  }
}

class OrganizationLearnerDoesNotBelongToOrganizationError extends DomainError {
  constructor(
    message = "L'utilisateur n'est pas autorisé à modifier cet élève.",
    code = 'ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION',
  ) {
    super(message, code);
  }
}

class OrganizationLearnerDoesNotHaveAPixAccountError extends DomainError {
  constructor(
    message = "L'utilisateur ne peut pas modifier un élève qui n'a pas de compte Pix associé.",
    code = 'ORGANIZATION_LEARNER_DOES_NOT_HAVE_A_PIX_ACCOUNT',
  ) {
    super(message, code);
  }
}

class PasswordNotMatching extends DomainError {
  constructor(message = 'Wrong password.') {
    super(message);
  }
}

class PasswordResetDemandNotFoundError extends DomainError {
  constructor(message = "La demande de réinitialisation de mot de passe n'existe pas.") {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        temporaryKey: ['Cette demande de réinitialisation n’existe pas.'],
      },
    };
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
  OrganizationLearnerDoesAlreadyHaveAnUsernameError,
  OrganizationLearnerDoesNotBelongToOrganizationError,
  OrganizationLearnerDoesNotHaveAPixAccountError,
  PasswordNotMatching,
  PasswordResetDemandNotFoundError,
  UserCantBeCreatedError,
  UserShouldChangePasswordError,
};
