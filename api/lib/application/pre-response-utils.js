import { BaseHttpError as OldBaseHttpError } from '../../src/shared/application/http-errors.js';
import { BaseHttpError } from '../../src/shared/application/http-errors.js';
import { DomainError } from '../../src/shared/domain/errors.js';
import * as errorManager from './error-manager.js';

function handleDomainAndHttpErrors(
  request,
  h,
  dependencies = {
    errorManager,
  },
) {
  const response = request.response;

  if (response instanceof DomainError || response instanceof BaseHttpError) {
    return h.continue;
  }

  // TODO: delete this condition after migration to shared complete
  if (response instanceof OldBaseHttpError) {
    return dependencies.errorManager.handle(request, h, response);
  }
  return h.continue;
}

export { handleDomainAndHttpErrors };
