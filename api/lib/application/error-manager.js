import { HttpErrors } from '../../src/shared/application//http-errors.js';
import * as errorSerializer from '../infrastructure/serializers/jsonapi/error-serializer.js';

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
