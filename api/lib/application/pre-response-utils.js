import errorManager from './error-manager';
import { BaseHttpError } from './http-errors';
import { DomainError } from '../domain/errors';

function handleDomainAndHttpErrors(request, h) {
  const response = request.response;

  if (response instanceof DomainError || response instanceof BaseHttpError) {
    return errorManager.handle(request, h, response);
  }

  return h.continue;
}

export default {
  handleDomainAndHttpErrors,
};
