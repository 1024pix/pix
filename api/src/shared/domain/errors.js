import { VALIDATION_ERRORS } from './constants.js';

class DomainError extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

class AlreadyExistingEntityError extends DomainError {
  constructor(message = 'L’entité existe déjà.', code, meta) {
    super(message, code);
    if (meta) this.meta = meta;
  }
}

class AssessmentEndedError extends DomainError {
  constructor(message = 'Evaluation terminée.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        error: ["L'évaluation est terminée. Nous n'avons plus de questions à vous poser."],
      },
    };
  }
}

class AssessmentResultNotCreatedError extends DomainError {
  constructor(message = "L'assessment result n'a pas pu être généré.") {
    super(message);
  }
}

class AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError extends DomainError {
  constructor() {
    super('Autonomous course requires a target profile with simplified access.');
  }
}

class CertificationAttestationGenerationError extends DomainError {
  constructor(message = "Une erreur est survenue durant la génération de l'attestation.") {
    super(message);
  }
}

class CsvImportError extends DomainError {
  constructor(code, meta) {
    super('An error occurred during CSV import');
    this.code = code;
    this.meta = meta;
  }
}

class ImportLearnerConfigurationError extends DomainError {
  constructor(message, code) {
    super(message);

    this.code = code;
  }
}

class EntityValidationError extends DomainError {
  constructor({ invalidAttributes }) {
    super("Échec de validation de l'entité.");
    this.invalidAttributes = invalidAttributes;
  }

  static fromJoiError(joiError) {
    const invalidAttributes = { attribute: joiError.context.key, message: joiError.message };

    return new EntityValidationError({ invalidAttributes });
  }

  static fromJoiErrors(joiErrors) {
    const invalidAttributes = joiErrors.map((error) => {
      return { attribute: error.context.key, message: error.message };
    });
    return new EntityValidationError({ invalidAttributes });
  }

  static fromMultipleEntityValidationErrors(entityValidationErrors) {
    const invalidAttributes = entityValidationErrors.reduce((invalidAttributes, entityValidationError) => {
      invalidAttributes.push(...entityValidationError.invalidAttributes);
      return invalidAttributes;
    }, []);
    return new EntityValidationError({ invalidAttributes });
  }
}

class ModelValidationError extends DomainError {
  constructor({ code, key, format, valids }) {
    super("Échec de validation de l'entité.");

    if (code === VALIDATION_ERRORS.PROPERTY_NOT_UNIQ) {
      this.why = 'uniqueness';
    }

    if (code === VALIDATION_ERRORS.FIELD_DATE_FORMAT) {
      this.why = 'date_format';
      this.acceptedFormat = format;
    }

    if (code === VALIDATION_ERRORS.FIELD_BAD_VALUES) {
      this.why = 'field_bad_values';
      this.valids = valids;
    }

    if (code === VALIDATION_ERRORS.FIELD_REQUIRED) {
      this.why = 'field_required';
    }

    if (code === VALIDATION_ERRORS.FIELD_NOT_STRING) {
      this.why = 'not_a_string';
    }

    if (code === VALIDATION_ERRORS.FIELD_STRING_MIN) {
      this.why = 'string_too_short';
      this.acceptedFormat = format;
    }

    if (code === VALIDATION_ERRORS.FIELD_STRING_MAX) {
      this.why = 'string_too_long';
      this.acceptedFormat = format;
    }

    this.key = key;
    this.code = code;
  }

  static unicityError({ key }) {
    return new ModelValidationError({ code: VALIDATION_ERRORS.PROPERTY_NOT_UNIQ, key });
  }

  static fromJoiError(joiError) {
    let code, key, format, valids;
    if (joiError.type === 'date.format') {
      code = VALIDATION_ERRORS.FIELD_DATE_FORMAT;
      key = joiError.context.key;
      format = joiError.context.format;
    }

    if (joiError.type === 'any.required') {
      code = VALIDATION_ERRORS.FIELD_REQUIRED;
      key = joiError.context.key;
    }

    if (joiError.type === 'any.only') {
      code = VALIDATION_ERRORS.FIELD_BAD_VALUES;
      key = joiError.context.key;
      valids = joiError.context.valids;
    }

    if (joiError.type === 'string.base') {
      code = VALIDATION_ERRORS.FIELD_NOT_STRING;
      key = joiError.context.key;
    }

    if (joiError.type === 'string.min') {
      code = VALIDATION_ERRORS.FIELD_STRING_MIN;
      key = joiError.context.key;
      format = joiError.context.limit;
    }

    if (joiError.type === 'string.max') {
      code = VALIDATION_ERRORS.FIELD_STRING_MAX;
      key = joiError.context.key;
      format = joiError.context.limit;
    }

    return new ModelValidationError({ code, key, format, valids });
  }
}

class ForbiddenAccess extends DomainError {
  constructor(message = 'Accès non autorisé.', code) {
    super(message);
    this.code = code;
  }
}

class InvalidInputDataError extends DomainError {
  constructor({ code = 'INVALID_INPUT_DATA', message = 'Provided input data is invalid', meta } = {}) {
    super(message);

    this.code = code;
    if (meta) this.meta = meta;
  }
}

class InvalidExternalUserTokenError extends DomainError {
  constructor(message = 'L’idToken de l’utilisateur externe est invalide.') {
    super(message);
  }
}

class InvalidPasswordForUpdateEmailError extends DomainError {
  constructor(message = 'Le mot de passe que vous avez saisi est invalide.') {
    super(message);
  }
}

class InvalidResultRecipientTokenError extends DomainError {
  constructor(message = 'Le token de récupération des résultats de la session de certification est invalide.') {
    super(message);
  }
}

class InvalidSessionResultTokenError extends DomainError {
  constructor(message = 'Le token de récupération des résultats de la session de certification est invalide.') {
    super(message);
  }
}

class InvalidTemporaryKeyError extends DomainError {
  constructor(message = 'Demande de réinitialisation invalide.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        temporaryKey: ['Cette demande de réinitialisation n’est pas valide.'],
      },
    };
  }
}

class LanguageNotSupportedError extends DomainError {
  constructor(languageCode) {
    super(`Given language is not supported : "${languageCode}"`);
    this.code = 'LANGUAGE_NOT_SUPPORTED';
    this.meta = { languageCode };
  }
}

class LocaleFormatError extends DomainError {
  constructor(locale) {
    super(`Given locale is in invalid format: "${locale}"`);
    this.code = 'INVALID_LOCALE_FORMAT';
    this.meta = { locale };
  }
}

class LocaleNotSupportedError extends DomainError {
  constructor(locale) {
    super(`Given locale is not supported : "${locale}"`);
    this.code = 'LOCALE_NOT_SUPPORTED';
    this.meta = { locale };
  }
}

class MissingAssessmentId extends DomainError {
  constructor(message = 'AssessmentId manquant ou incorrect') {
    super(message);
  }
}

class MissingBadgeCriterionError extends DomainError {
  constructor(message = 'Vous devez définir au moins un critère pour créer ce résultat thématique.') {
    super(message);
  }
}

class NoCertificationAttestationForDivisionError extends DomainError {
  constructor(division) {
    const message = `Aucune attestation de certification pour la classe ${division}.`;
    super(message);
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Erreur, ressource introuvable.', code) {
    super(message);
    this.code = code;
  }
}

class OidcError extends DomainError {
  constructor({ code = 'OIDC_GENERIC_ERROR', message }) {
    super(message);
    this.code = code;
  }
}

class TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization extends DomainError {
  constructor() {
    super('Target profile requires to be linked to autonomous course organization.');
  }
}

class UserNotAuthorizedToAccessEntityError extends DomainError {
  constructor(message = 'User is not authorized to access ressource') {
    super(message);
  }
}

class UserNotAuthorizedToUpdateEmailError extends DomainError {
  constructor(message = 'User is not authorized to update email') {
    super(message);
  }
}
class UserNotAuthorizedToUpdatePasswordError extends DomainError {
  constructor(
    message = "L'utilisateur n'est pas autorisé à mettre à jour ce mot de passe.",
    code = 'USER_NOT_AUTHORIZED_TO_UPDATE_PASSWORD',
  ) {
    super(message, code);
  }
}

class CertificationCenterPilotFeaturesConflictError extends DomainError {
  constructor(message = 'Certification center pilot features incompatibility', code = 'PILOT_FEATURES_CONFLICT') {
    super(message);
    this.code = code;
  }
}

export {
  AlreadyExistingEntityError,
  AssessmentEndedError,
  AssessmentResultNotCreatedError,
  AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError,
  CertificationAttestationGenerationError,
  CertificationCenterPilotFeaturesConflictError,
  CsvImportError,
  DomainError,
  EntityValidationError,
  ForbiddenAccess,
  ImportLearnerConfigurationError,
  InvalidExternalUserTokenError,
  InvalidInputDataError,
  InvalidPasswordForUpdateEmailError,
  InvalidResultRecipientTokenError,
  InvalidSessionResultTokenError,
  InvalidTemporaryKeyError,
  LanguageNotSupportedError,
  LocaleFormatError,
  LocaleNotSupportedError,
  MissingAssessmentId,
  MissingBadgeCriterionError,
  ModelValidationError,
  NoCertificationAttestationForDivisionError,
  NotFoundError,
  OidcError,
  TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization,
  UserNotAuthorizedToAccessEntityError,
  UserNotAuthorizedToUpdateEmailError,
  UserNotAuthorizedToUpdatePasswordError,
};
