const errorManager = require('./error-manager.js');
const { BaseHttpError } = require('./http-errors.js');
const { DomainError } = require('../domain/errors.js');

function handleDomainAndHttpErrors(
  request,
  h,
  dependencies = {
    errorManager,
  }
) {
  const response = request.response;

  if (response instanceof DomainError || response instanceof BaseHttpError) {
    return dependencies.errorManager.handle(request, h, response);
  }

  return h.continue;
}

module.exports = {
  handleDomainAndHttpErrors,
};
