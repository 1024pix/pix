import * as errorSerializer from '../infrastructure/serializers/jsonapi/error-serializer.js';
import { HttpErrors } from './http-errors.js';

function _mapToHttpError(error) {
  if (error instanceof HttpErrors.BaseHttpError) {
    return error;
  }
  return new HttpErrors.BaseHttpError(error.message);
}

function handle(request, h, error) {
  const httpError = _mapToHttpError(error);

  return h.response(errorSerializer.serialize(httpError)).code(httpError.status);
}

export { handle };
