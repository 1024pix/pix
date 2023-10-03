import * as errorManager from './error-manager.js';
import { BaseHttpError } from './http-errors.js';
import { DomainError } from '../domain/errors.js';

function handleDomainAndHttpErrors(
  request,
  h,
  dependencies = {
    errorManager,
  },
) {
  const response = request.response;

  if (response instanceof DomainError || response instanceof BaseHttpError) {
    return dependencies.errorManager.handle(request, h, response);
  }

  return h.continue;
}

export { handleDomainAndHttpErrors };
