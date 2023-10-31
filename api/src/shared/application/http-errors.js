import jsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = jsonapiSerializer;

class BaseHttpError extends Error {
  constructor(message) {
    super(message);
    this.title = 'Default Bad Request';
    this.status = 400;
  }
}

class UnprocessableEntityError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Unprocessable entity';
    this.code = code;
    this.meta = meta;
    this.status = 422;
  }
}

class PreconditionFailedError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Precondition Failed';
    this.code = code;
    this.meta = meta;
    this.status = 412;
  }
}

class ConflictError extends BaseHttpError {
  constructor(message = 'Conflict between request and server state.', code, meta) {
    super(message);
    this.code = code;
    this.meta = meta;
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
  constructor(message, code, title) {
    super(message);
    this.title = title || 'Not Found';
    this.status = 404;
    this.code = code;
  }
}

class UnauthorizedError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Unauthorized';
    this.status = 401;
    this.code = code;
    this.meta = meta;
  }
}

class PasswordShouldChangeError extends BaseHttpError {
  constructor(message, meta) {
    super(message);
    this.title = 'PasswordShouldChange';
    this.status = 401;
    this.code = 'SHOULD_CHANGE_PASSWORD';
    this.meta = meta;
  }
}

class ForbiddenError extends BaseHttpError {
  constructor(message, code) {
    super(message);
    this.title = 'Forbidden';
    this.status = 403;
    this.code = code;
  }
}

class ServiceUnavailableError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'ServiceUnavailable';
    this.status = 503;
  }
}

class BadRequestError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Bad Request';
    this.status = 400;
    this.meta = meta;
    this.code = code;
  }
}

class PayloadTooLargeError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Payload too large';
    this.code = code;
    this.meta = meta;
    this.status = 413;
  }
}

class SessionPublicationBatchError extends BaseHttpError {
  constructor(batchId) {
    super(`${batchId}`);
    this.title = 'One or more error occurred while publishing session in batch';
    (this.code = 'SESSION_PUBLICATION_BATCH_PARTIALLY_FAILED'), (this.status = 207);
  }
}

class InternalServerError extends BaseHttpError {
  constructor(message, title) {
    super(message);
    this.title = title || 'Internal Server Error';
    this.status = 500;
  }
}

class TooManyRequestsError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'Too many requests';
    this.status = 429;
  }
}

function sendJsonApiError(httpError, h) {
  const jsonApiError = new JSONAPIError({
    status: httpError.status.toString(),
    title: httpError.title,
    detail: httpError.message,
    code: httpError.code,
    meta: httpError.meta,
  });
  return h.response(jsonApiError).code(httpError.status).takeover();
}

const HttpErrors = {
  BadRequestError,
  BaseHttpError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  MissingQueryParamError,
  NotFoundError,
  PasswordShouldChangeError,
  PayloadTooLargeError,
  PreconditionFailedError,
  sendJsonApiError,
  ServiceUnavailableError,
  SessionPublicationBatchError,
  UnauthorizedError,
  UnprocessableEntityError,
  TooManyRequestsError,
};

export {
  HttpErrors,
  BadRequestError,
  BaseHttpError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  MissingQueryParamError,
  NotFoundError,
  PasswordShouldChangeError,
  PayloadTooLargeError,
  PreconditionFailedError,
  sendJsonApiError,
  ServiceUnavailableError,
  UnauthorizedError,
  UnprocessableEntityError,
  TooManyRequestsError,
};
