import * as errorSerializer from '../../infrastructure/serializers/jsonapi/error-serializer.js';

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

class InvalidEntityError extends BaseHttpError {
  constructor({ message, code, meta, source, title } = {}) {
    super(message);
    this.title = title;
    this.code = code;
    this.meta = meta;
    this.source = source;
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

class LockedError extends BaseHttpError {
  constructor(message = 'The resource being accessed is currently locked', code, meta) {
    super(message);
    this.code = code;
    this.meta = meta;
    this.title = 'Locked';
    this.status = 423;
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
  constructor(message, code, meta) {
    super(message);
    this.title = 'Not Found';
    this.status = 404;
    this.code = code;
    this.meta = meta;
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
  constructor(message, code, meta) {
    super(message);
    this.title = 'Forbidden';
    this.status = 403;
    this.code = code;
    this.meta = meta;
  }
}

class InternalServerError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'Internal server error';
    this.status = 500;
  }
}

class ServiceUnavailableError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'ServiceUnavailable';
    this.status = 503;
  }
}

class BadGatewayError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'BadGateway';
    this.status = 502;
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
    this.code = 'SESSION_PUBLICATION_BATCH_PARTIALLY_FAILED';
    this.status = 207;
  }
}

class TooManyRequestsError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'Too many requests';
    this.status = 429;
  }
}

/**
 * @typedef {import('../../infrastructure/serializers/jsonapi/error-serializer.js').HttpError} HttpError
 * @param {Array<HttpError>|HttpError} httpError
 * @param {Object} h
 * @returns {Promise}
 */
function sendJsonApiError(httpError, h) {
  const errors = errorSerializer.serialize(httpError);
  return h.response(errors).code(Number(errors.errors[0].status)).takeover();
}

const HttpErrors = {
  BadGatewayError,
  BadRequestError,
  BaseHttpError,
  ConflictError,
  LockedError,
  ForbiddenError,
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
  InternalServerError,
  InvalidEntityError,
};

export {
  BadGatewayError,
  BadRequestError,
  BaseHttpError,
  ConflictError,
  ForbiddenError,
  HttpErrors,
  LockedError,
  MissingQueryParamError,
  NotFoundError,
  PasswordShouldChangeError,
  PayloadTooLargeError,
  PreconditionFailedError,
  sendJsonApiError,
  ServiceUnavailableError,
  SessionPublicationBatchError,
  TooManyRequestsError,
  UnauthorizedError,
  UnprocessableEntityError,
};
