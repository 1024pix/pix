class NotFoundError extends Error {
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

module.exports = { NotFoundError, NotElligibleToScoringError, PasswordNotMatching, InvalidTokenError, AlreadyRegisteredEmailError };
