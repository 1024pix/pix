class DomainError extends Error {
  constructor(message) {
    super(message);
  }
}

class AlreadyExistingMembershipError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class AlreadyRatedAssessmentError extends DomainError {
  constructor() {
    super('Cette évaluation a déjà été évaluée.');
  }
}

class AlreadyRegisteredEmailError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class AssessmentStartError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class UserNotAuthorizedToCreateCampaignError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class UserNotAuthorizedToUpdateRessourceError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class UserNotAuthorizedToGetCampaignResultsError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class CampaignWithoutOrganizationError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class AssessmentEndedError extends DomainError {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        error: ['L\'évaluation est terminée. Nous n\'avons plus de questions à vous poser.'],
      },
    };
  }
}

class CampaignCodeError extends DomainError {
  constructor() {
    super('Le code campagne n\'existe pas.');
  }
}

class CertificationComputeError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class CertificationCenterMembershipCreationError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class ChallengeAlreadyAnsweredError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class EntityValidationError extends DomainError {
  constructor({ invalidAttributes }) {
    super();
    this.invalidAttributes = invalidAttributes;
  }

  static fromJoiErrors(joiErrors) {
    const invalidAttributes = joiErrors.map((error) => {
      return { attribute: error.context.key, message: error.message };
    });
    return new EntityValidationError({ invalidAttributes });
  }

  static fromMultipleEntityValidationErrors(entityValidationErrors) {
    const invalidAttributes = entityValidationErrors.reduce(
      (invalidAttributes, entityValidationError) => {
        invalidAttributes.push(...entityValidationError.invalidAttributes);
        return invalidAttributes;
      },
      []);
    return new EntityValidationError({ invalidAttributes });
  }
}

class ForbiddenAccess extends DomainError {
  constructor(message) {
    super(message);
  }
}

class InvaliOrganizationIdError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class InvalidSnapshotCode extends DomainError {
  constructor(message) {
    super(message);
  }
}

class InvalidTokenError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class InvalidRecaptchaTokenError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class InvalidTemporaryKeyError extends DomainError {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        temporaryKey: ['Cette demande de réinitialisation n’est pas valide.'],
      },
    };
  }
}

class MembershipCreationError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class MissingOrInvalidCredentialsError extends DomainError {
  constructor() {
    super('Missing or invalid credentials');
  }
}

class NotCompletedAssessmentError extends DomainError {
  constructor() {
    super('Cette évaluation n\'est pas terminée.');
  }
}

class NotElligibleToQmailError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class NotFoundError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class ObjectValidationError extends DomainError {

}

class PasswordNotMatching extends DomainError {
  constructor(message) {
    super(message);
  }
}

class PasswordResetDemandNotFoundError extends DomainError {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        temporaryKey: ['Cette demande de réinitialisation n’existe pas.'],
      },
    };
  }
}

class UserNotAuthorizedToAccessEntity extends DomainError {
  constructor() {
    super('User is not authorized to access ressource');
  }
}

class UserNotAuthorizedToCertifyError extends DomainError {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        authorization: ['Vous n’êtes pas autorisé à passer un test de certification.'],
      },
    };
  }
}

class UserNotFoundError extends NotFoundError {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        id: ['Ce compte est introuvable.'],
      },
    };
  }
}

class WrongDateFormatError extends DomainError {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        date: ['Veuillez renseigner une date de session au format (jj/mm/yyyy).'],
      },
    };
  }
}

/**
 * @deprecated use InfrastructureError instead for unexpected internal errors
 */
class InternalError extends DomainError {
  constructor() {
    super();
    this.errorStack = [
      'Une erreur interne est survenue.',
    ];
  }

  getErrorMessage() {
    return {
      data: {
        error: this.errorStack,
      },
    };
  }
}

module.exports = {
  DomainError,
  AlreadyExistingMembershipError,
  AlreadyRatedAssessmentError,
  AlreadyRegisteredEmailError,
  AssessmentEndedError,
  AssessmentStartError,
  CampaignCodeError,
  CampaignWithoutOrganizationError,
  CertificationComputeError,
  CertificationCenterMembershipCreationError,
  ChallengeAlreadyAnsweredError,
  EntityValidationError,
  ForbiddenAccess,
  InternalError,
  InvalidRecaptchaTokenError,
  InvalidSnapshotCode,
  InvalidTemporaryKeyError,
  InvalidTokenError,
  InvaliOrganizationIdError,
  MembershipCreationError,
  MissingOrInvalidCredentialsError,
  NotCompletedAssessmentError,
  NotElligibleToQmailError,
  NotFoundError,
  ObjectValidationError,
  PasswordNotMatching,
  PasswordResetDemandNotFoundError,
  UserNotAuthorizedToAccessEntity,
  UserNotAuthorizedToCertifyError,
  UserNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToUpdateRessourceError,
  UserNotAuthorizedToGetCampaignResultsError,
  UserNotFoundError,
  WrongDateFormatError,
};
