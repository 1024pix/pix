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

  // TODO: delete this condition after migration to shared complete
  if (response.fromShared) {
    return h.continue;
  }

  if (response instanceof DomainError || response instanceof BaseHttpError) {
    return dependencies.errorManager.handle(request, h, response);
  }
  return h.continue;
}

export { handleDomainAndHttpErrors };
