import { errorSerializer } from '../../infrastructure/serializers/jsonapi/error-serializer.js';

export class BaseHttpError extends Error {
  constructor(message) {
    super(message);
    this.title = 'Default Bad Request';
    this.status = 400;
  }
}

export class UnprocessableEntityError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Unprocessable entity';
    this.code = code;
    this.meta = meta;
    this.status = 422;
  }
}

export class InvalidEntityError extends BaseHttpError {
  constructor({ message, code, meta, source, title } = {}) {
    super(message);
    this.title = title;
    this.code = code;
    this.meta = meta;
    this.source = source;
    this.status = 422;
  }
}

export class PreconditionFailedError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Precondition Failed';
    this.code = code;
    this.meta = meta;
    this.status = 412;
  }
}

export class ConflictError extends BaseHttpError {
  constructor(message = 'Conflict between request and server state.', code, meta) {
    super(message);
    this.code = code;
    this.meta = meta;
    this.title = 'Conflict';
    this.status = 409;
  }
}

export class LockedError extends BaseHttpError {
  constructor(message = 'The resource being accessed is currently locked', code, meta) {
    super(message);
    this.code = code;
    this.meta = meta;
    this.title = 'Locked';
    this.status = 423;
  }
}

export class MissingQueryParamError extends BaseHttpError {
  constructor(missingParamName) {
    const message = `Missing ${missingParamName} query parameter.`;
    super(message);
    this.title = 'Missing Query Parameter';
    this.status = 400;
  }
}

export class NotFoundError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Not Found';
    this.status = 404;
    this.code = code;
    this.meta = meta;
  }
}

export class UnauthorizedError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Unauthorized';
    this.status = 401;
    this.code = code;
    this.meta = meta;
  }
}

export class PasswordShouldChangeError extends BaseHttpError {
  constructor(message, meta) {
    super(message);
    this.title = 'PasswordShouldChange';
    this.status = 401;
    this.code = 'SHOULD_CHANGE_PASSWORD';
    this.meta = meta;
  }
}

export class ForbiddenError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Forbidden';
    this.status = 403;
    this.code = code;
    this.meta = meta;
  }
}

export class InternalServerError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'Internal server error';
    this.status = 500;
  }
}

export class ServiceUnavailableError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'ServiceUnavailable';
    this.status = 503;
  }
}

export class BadGatewayError extends BaseHttpError {
  constructor(message) {
    super(message);
    this.title = 'BadGateway';
    this.status = 502;
  }
}

export class BadRequestError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Bad Request';
    this.status = 400;
    this.meta = meta;
    this.code = code;
  }
}

export class PayloadTooLargeError extends BaseHttpError {
  constructor(message, code, meta) {
    super(message);
    this.title = 'Payload too large';
    this.code = code;
    this.meta = meta;
    this.status = 413;
  }
}

export class SessionPublicationBatchError extends BaseHttpError {
  constructor(batchId) {
    super(`${batchId}`);
    this.title = 'One or more error occurred while publishing session in batch';
    this.code = 'SESSION_PUBLICATION_BATCH_PARTIALLY_FAILED';
    this.status = 207;
  }
}

/**
 * @typedef {import('../../infrastructure/serializers/jsonapi/error-serializer.js').HttpError} HttpError
 * @param {Array<HttpError>|HttpError} httpError
 * @param {Object} h
 * @returns {Promise}
 */
export function sendJsonApiError(httpError, h) {
  const errors = errorSerializer.serialize(httpError);
  return h.response(errors).code(Number(errors.errors[0].status)).takeover();
}
