class NotFoundError extends Error {
  constructor(message) {
    super(message);
  }
}

class InvaliOrganizationIdError extends Error {
  constructor(message) {
    super(message);
  }
}

class InvalidTokenError extends Error {
  constructor(message) {
    super(message);
  }
}

class NotElligibleToQmailError extends Error {
  constructor(message) {
    super(message);
  }
}

class PasswordNotMatching extends Error {
  constructor(message) {
    super(message);
  }
}

class AlreadyRegisteredEmailError extends Error {
  constructor(message) {
    super(message);
  }
}

class NotCompletedAssessmentError extends Error {
  constructor() {
    super('Cette évaluation n\'est pas terminée.');
  }
}

class UserNotFoundError extends Error {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        id: ['Ce compte est introuvable.']
      }
    };
  }
}

class InternalError extends Error {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        error: ['Une erreur interne est survenue.']
      }
    };
  }
}

class PasswordResetDemandNotFoundError extends Error {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        temporaryKey: ['Cette demande de réinitialisation n’existe pas.']
      }
    };
  }
}

class InvalidTemporaryKeyError extends Error {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        temporaryKey: ['Cette demande de réinitialisation n’est pas valide.']
      }
    };
  }
}

class UserNotAuthorizedToCertifyError extends Error {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        authorization: ['Vous n’êtes pas autorisé à passer un test de certification.']
      }
    };
  }
}

class AssessmentEndedError extends Error {
  constructor() {
    super();
  }

  getErrorMessage() {
    return {
      data: {
        error: ['L\'évaluation est terminée. Nous n\'avons plus de questions à vous poser.']
      }
    };
  }
}

module.exports = {
  NotFoundError,
  PasswordNotMatching,
  InvalidTokenError,
  AlreadyRegisteredEmailError,
  InvaliOrganizationIdError,
  UserNotFoundError,
  InternalError,
  PasswordResetDemandNotFoundError,
  InvalidTemporaryKeyError,
  NotElligibleToQmailError,
  UserNotAuthorizedToCertifyError,
  NotCompletedAssessmentError,
  AssessmentEndedError
};
