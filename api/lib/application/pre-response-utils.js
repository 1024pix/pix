const errorManager = require('./error-manager');
const { BaseHttpError } = require('./http-errors');
const { DomainError } = require('../domain/errors');
const monitoringTools = require('../infrastructure/monitoring-tools');

const isExpectedError = (error) => {
  if (error instanceof DomainError || error instanceof BaseHttpError) {
    return true;
  }
};

function handleDomainAndHttpErrors(request, h) {
  const response = request.response;

  if (response instanceof Error) {
    const error = response;
    if (isExpectedError(error)) {
      return errorManager.handle(request, h, response);
    } else {
      monitoringTools.logErrorWithCorrelationIds(response);
    }
  }

  return h.continue;
}

module.exports = {
  handleDomainAndHttpErrors,
};
