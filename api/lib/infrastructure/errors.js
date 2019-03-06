class InfrastructureError extends Error {
  constructor(message) {
    super(message);
    this.title = 'Internal Server Error';
    this.code = 500;
  }
}

class ConflictError extends InfrastructureError {
  constructor(message = 'Conflict between request and server state.') {
    super(message);
    this.title = 'Conflict';
    this.code = 409;
  }
}

class MissingQueryParamError extends InfrastructureError {
  constructor(missingParamName) {
    const message = `Missing ${missingParamName} query parameter.`;
    super(message);
    this.title = 'Missing Query Parameter';
    this.code = 400;
  }
}

class NotFoundError extends InfrastructureError {
  constructor(message) {
    super(message);
    this.title = 'Not Found';
    this.code = 404;
  }
}

class UnauthorizedError extends InfrastructureError {
  constructor(message) {
    super(message);
    this.title = 'Unauthorized';
    this.code = 401;
  }
}

class ForbiddenError extends InfrastructureError {
  constructor(message) {
    super(message);
    this.title = 'Forbidden';
    this.code = 403;
  }
}

class BadRequestError extends InfrastructureError {
  constructor(message) {
    super(message);
    this.title = 'Bad Request';
    this.code = 400;
  }
}

module.exports = {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InfrastructureError,
  MissingQueryParamError,
  NotFoundError,
  UnauthorizedError,
};
