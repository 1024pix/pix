const errorManager = require('./error-manager.js');
const { BaseHttpError } = require('./http-errors.js');
const { DomainError } = require('../domain/errors.js');

function handleDomainAndHttpErrors(request, h) {
  const response = request.response;

  if (response instanceof DomainError || response instanceof BaseHttpError) {
    return errorManager.handle(request, h, response);
  }

  return h.continue;
}

module.exports = {
  handleDomainAndHttpErrors,
};
