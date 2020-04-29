class BaseHttpError extends Error {
  constructor(message) {
    super(message);
    this.title = 'Internal Server Error';
    this.status = 500;
  }
}

class UnprocessableEntityError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'Unprocessable entity';
    this.status = 422;
  }
}

class PreconditionFailedError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'Precondition Failed';
    this.status = 412;
  }
}

class ConflictError extends BaseHttpError {
  constructor(message = 'Conflict between request and server state.') {
    super(message);
    this.title = 'Conflict';
    this.status = 409;
  }
}

class MissingQueryParamError extends BaseHttpError {
  constructor(missingParamName) {
    const message = `Missing ${missingParamName} query parameter.`;
    super(message);
    this.title = 'Missing Query Parameter';
    this.status = 400;
  }
}

class NotFoundError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'Not Found';
    this.status = 404;
  }
}

class UnauthorizedError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'Unauthorized';
    this.status = 401;
  }
}

class PasswordShouldChangeError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'PasswordShouldChange';
    this.status = 401;
  }
}

class ForbiddenError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'Forbidden';
    this.status = 403;
  }
}

class BadRequestError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'Bad Request';
    this.status = 400;
  }
}

module.exports = {
  BadRequestError,
  BaseHttpError,
  ConflictError,
  ForbiddenError,
  MissingQueryParamError,
  NotFoundError,
  PasswordShouldChangeError,
  PreconditionFailedError,
  UnauthorizedError,
  UnprocessableEntityError,
};
