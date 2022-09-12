const errorManager = require('./error-manager');
const { BaseHttpError, UnauthorizedError } = require('./http-errors');
const { DomainError } = require('../domain/errors');

function handleDomainAndHttpErrors(request, h) {
  const response = request.response;

  if (response instanceof DomainError || response instanceof BaseHttpError) {
    return errorManager.handle(request, h, response);
  }

  // Ne devrait pas etre necessaire
  if (response.isBoom && response.output.statusCode === 401) {
    return errorManager.handle(request, h, new UnauthorizedError(undefined, 401));
  }

  return h.continue;
}

module.exports = {
  handleDomainAndHttpErrors,
};
