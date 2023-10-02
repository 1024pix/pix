import * as errorSerializer from '../infrastructure/serializers/jsonapi/error-serializer.js';
import { HttpErrors } from './http-errors.js';
import * as DomainErrors from '../domain/errors.js';

function _mapToHttpError(error) {
  if (error instanceof DomainErrors.NotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.ForbiddenAccess) {
    return new HttpErrors.ForbiddenError(error.message);
  }
}

function handle(request, h, error) {
  const httpError = _mapToHttpError(error);

  return h.response(errorSerializer.serialize(httpError)).code(httpError.status);
}

export { handle, _mapToHttpError };
