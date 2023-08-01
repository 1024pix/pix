class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ForbiddenAccess extends DomainError {
  constructor(message = 'Accès non autorisé.', code) {
    super(message);
    this.code = code;
  }
}

class EntityValidationError extends DomainError {
  constructor({ invalidAttributes }) {
    super("Échec de validation de l'entité.");
    this.invalidAttributes = invalidAttributes;
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

class CsvImportError extends DomainError {
  constructor(code, meta) {
    super('An error occurred during CSV import');
    this.code = code;
    this.meta = meta;
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Erreur, ressource introuvable.') {
    super(message);
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

class UserNotAuthorizedToAccessEntityError extends DomainError {
  constructor(message = 'User is not authorized to access ressource') {
    super(message);
  }
}

export {
  DomainError,
  AssessmentEndedError,
  ForbiddenAccess,
  EntityValidationError,
  CsvImportError,
  NotFoundError,
  UserNotAuthorizedToAccessEntityError,
};
