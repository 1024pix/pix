const errorManager = require('./error-manager');
const { DomainError } = require('../../domain/errors');
const { InfrastructureError } = require('../errors');

function catchDomainAndInfrastructureErrors(request, h) {
  const response = request.response;

  if (response instanceof DomainError || response instanceof InfrastructureError) {
    return errorManager.send(h, response);
  }

  return h.continue;
}

module.exports = {
  catchDomainAndInfrastructureErrors,
};
