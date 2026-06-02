import { DomainError } from '../../shared/domain/errors.js';

class AuthenticationKeyExpired extends DomainError {
  constructor() {
    super('This authentication key has expired.', 'EXPIRED_AUTHENTICATION_KEY');
  }
}

class PasswordResetTokenInvalidOrExpired extends DomainError {
  constructor() {
    super(
      'The password reset token has expired, retry connecting with temporary password',
      'PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED',
    );
  }
}

class DifferentExternalIdentifierError extends DomainError {
  constructor(
    message = "La valeur de l'externalIdentifier de la méthode de connexion ne correspond pas à celui reçu par le partenaire.",
  ) {
    super(message);
  }
}

class InvalidOrAlreadyUsedEmailError extends DomainError {
  constructor() {
    super('Invalid or already used e-mail address', 'INVALID_OR_ALREADY_USED_EMAIL');
  }
}

class MissingClientApplicationScopesError extends DomainError {
  constructor() {
    super('Client application must have at least one scope', 'MISSING_CLIENT_APPLICATION_SCOPES');
  }
}

class DeleteUnknownClientApplicationJurisdictionTagError extends DomainError {
  constructor() {
    super("Can't delete unknown jurisdiction tag", 'UNKNOW_CLIENT_APPLICATION_JURISDICTION_TAG');
  }
}

class OrganizationLearnerNotBelongToOrganizationIdentityError extends DomainError {
  constructor(message = 'Organization Learner identity does not belong to Organization Identity') {
    super(message);
  }
}

class OrganizationLearnerIdentityNotFoundError extends DomainError {
  constructor(message = 'Organization Learner Identity not found.') {
    super(message);
  }
}

class MissingOrInvalidCredentialsError extends DomainError {
  constructor(meta = {}) {
    super('Missing or invalid credentials', 'MISSING_OR_INVALID_CREDENTIALS');
    this.meta = {};
    this.meta.isLoginFailureWithUsername = meta?.isLoginFailureWithUsername ?? false;
    if (meta?.remainingAttempts) {
      this.meta.remainingAttempts = meta.remainingAttempts;
    }
  }
}

class MissingUserAccountError extends DomainError {
  constructor(message = 'Les informations de compte requises sont manquantes') {
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

class PixAdminLoginFromPasswordDisabledError extends DomainError {
  constructor() {
    super('PixAdminLoginFromPassword disabled. Use SSO authentication.', 'PIX_ADMIN_LOGIN_FROM_PASSWORD_DISABLED');
  }
}

class UserCantBeCreatedError extends DomainError {
  constructor(message = "L'utilisateur ne peut pas être créé") {
    super(message);
  }
}

class RevokeUntilMustBeAnInstanceOfDate extends DomainError {
  constructor(message = 'Revoke Until must be an instance of Date') {
    super(message);
  }
}

class UserIdIsRequiredError extends DomainError {
  constructor(message = 'User Id is required') {
    super(message);
  }
}

class UserShouldChangePasswordError extends DomainError {
  constructor(message = 'User password must be changed.', meta) {
    super(message);
    this.meta = meta;
  }
}

class InvalidLtiPlatformRegistrationError extends DomainError {
  constructor(message = 'LTI platform registration is invalid', { cause } = {}) {
    super(message, 'INVALID_LTI_PLATFORM_REGISTRATION');
    this.cause = cause;
  }
}

export {
  AuthenticationKeyExpired,
  DeleteUnknownClientApplicationJurisdictionTagError,
  DifferentExternalIdentifierError,
  InvalidLtiPlatformRegistrationError,
  InvalidOrAlreadyUsedEmailError,
  MissingClientApplicationScopesError,
  MissingOrInvalidCredentialsError,
  MissingUserAccountError,
  OrganizationLearnerIdentityNotFoundError,
  OrganizationLearnerNotBelongToOrganizationIdentityError,
  PasswordResetDemandNotFoundError,
  PasswordResetTokenInvalidOrExpired,
  PixAdminLoginFromPasswordDisabledError,
  RevokeUntilMustBeAnInstanceOfDate,
  UserCantBeCreatedError,
  UserIdIsRequiredError,
  UserShouldChangePasswordError,
};
