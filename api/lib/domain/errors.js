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

class NotElligibleToScoringError extends Error {
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

module.exports = {
  NotFoundError,
  NotElligibleToScoringError,
  PasswordNotMatching,
  InvalidTokenError,
  AlreadyRegisteredEmailError,
  InvaliOrganizationIdError,
  UserNotFoundError,
  InternalError,
  PasswordResetDemandNotFoundError,
  InvalidTemporaryKeyError,
  NotElligibleToQmailError
};
