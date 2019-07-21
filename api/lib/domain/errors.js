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

class UserHasBeenMigratedToV2Error extends DomainError {
  constructor(message) {
    super(message);
  }
}

class UserNotAuthorizedToCreateCampaignError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class UserNotAuthorizedToUpdateResourceError extends DomainError {
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

class CompetenceResetError extends DomainError {
  constructor(remainingDaysBeforeReset) {
    super(`Il reste ${remainingDaysBeforeReset} jours avant de pouvoir réinitiliser la compétence.`);
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

class CertificationCandidateCreationOrUpdateError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class CertificationCandidateDeletionError extends DomainError {
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

class AssessmentNotCompletedError extends DomainError {
  constructor() {
    super('Cette évaluation n\'est pas terminée.');
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
    super('User is not certifiable');
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
  AssessmentNotCompletedError,
  AssessmentStartError,
  CampaignCodeError,
  CampaignWithoutOrganizationError,
  CompetenceResetError,
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateDeletionError,
  CertificationCenterMembershipCreationError,
  CertificationComputeError,
  ChallengeAlreadyAnsweredError,
  EntityValidationError,
  ForbiddenAccess,
  InternalError,
  InvaliOrganizationIdError,
  InvalidRecaptchaTokenError,
  InvalidSnapshotCode,
  InvalidTemporaryKeyError,
  InvalidTokenError,
  MembershipCreationError,
  MissingOrInvalidCredentialsError,
  NotFoundError,
  ObjectValidationError,
  PasswordNotMatching,
  PasswordResetDemandNotFoundError,
  UserHasBeenMigratedToV2Error,
  UserNotAuthorizedToAccessEntity,
  UserNotAuthorizedToCertifyError,
  UserNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToGetCampaignResultsError,
  UserNotAuthorizedToUpdateResourceError,
  UserNotFoundError,
  WrongDateFormatError,
};
