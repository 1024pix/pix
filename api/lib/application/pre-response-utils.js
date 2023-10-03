import * as errorManager from './error-manager.js';
import { BaseHttpError as OldBaseHttpError } from './http-errors.js';
import { BaseHttpError } from '../../src/shared/application/http-errors.js';
import { DomainError as OldDomainError } from '../domain/errors.js';
import { DomainError } from '../../src/shared/domain/errors.js';

function handleDomainAndHttpErrors(
  request,
  h,
  dependencies = {
    errorManager,
  },
) {
  const response = request.response;

  // TODO: delete this condition after migration to shared complete
  if (response instanceof DomainError || response instanceof BaseHttpError) {
    return h.continue;
  }

  if (response instanceof OldDomainError || response instanceof OldBaseHttpError) {
    return dependencies.errorManager.handle(request, h, response);
  }
  return h.continue;
}

export { handleDomainAndHttpErrors };
