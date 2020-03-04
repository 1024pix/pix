const errorManager = require('./error-manager');
const { HttpError } = require('./http-errors');
const { DomainError } = require('../domain/errors');

function catchDomainAndHttpErrors(request, h) {
  const response = request.response;

  if (response instanceof DomainError || response instanceof HttpError) {
    return errorManager.send(h, response);
  }

  return h.continue;
}

module.exports = {
  catchDomainAndHttpErrors,
};
