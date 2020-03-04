class HttpError extends Error {
  constructor(message) {
    super(message);
    this.title = 'Internal Server Error';
    this.status = 500;
  }
}

class UnprocessableEntityError extends HttpError {
  constructor(message) {
    super(message);
    this.title = 'Unprocessable entity';
    this.status = 422;
  }
}

class PreconditionFailedError extends HttpError {
  constructor(message) {
    super(message);
    this.title = 'Precondition Failed';
    this.status = 421;
  }
}

class ConflictError extends HttpError {
  constructor(message = 'Conflict between request and server state.') {
    super(message);
    this.title = 'Conflict';
    this.status = 409;
  }
}

class MissingQueryParamError extends HttpError {
  constructor(missingParamName) {
    const message = `Missing ${missingParamName} query parameter.`;
    super(message);
    this.title = 'Missing Query Parameter';
    this.status = 400;
  }
}

class NotFoundError extends HttpError {
  constructor(message) {
    super(message);
    this.title = 'Not Found';
    this.status = 404;
  }
}

class UnauthorizedError extends HttpError {
  constructor(message) {
    super(message);
    this.title = 'Unauthorized';
    this.status = 401;
  }
}

class ForbiddenError extends HttpError {
  constructor(message) {
    super(message);
    this.title = 'Forbidden';
    this.status = 403;
  }
}

class BadRequestError extends HttpError {
  constructor(message) {
    super(message);
    this.title = 'Bad Request';
    this.status = 400;
  }
}

module.exports = {
  UnprocessableEntityError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  HttpError,
  MissingQueryParamError,
  NotFoundError,
  UnauthorizedError,
  PreconditionFailedError,
};
