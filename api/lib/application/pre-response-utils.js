import * as errorManager from './error-manager.js';
import { BaseHttpError } from './http-errors.js';
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

  if (response instanceof OldDomainError || response instanceof DomainError || response instanceof BaseHttpError) {
    return dependencies.errorManager.handle(request, h, response);
  }
  // TODO @ask vincent pourquoi as-tu supprimé cette ligne dans ta branche de POC
  return h.continue;
}

export { handleDomainAndHttpErrors };
