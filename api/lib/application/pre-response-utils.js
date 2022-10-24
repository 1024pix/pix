const errorManager = require('./error-manager');
const { BaseHttpError } = require('./http-errors');
const { DomainError } = require('../domain/errors');
const monitoringTools = require('../infrastructure/monitoring-tools');

const isExpectedError = (error) => {
  return error instanceof DomainError || error instanceof BaseHttpError;
};

function handleErrors(request, h) {
  const response = request.response;

  if (response instanceof Error) {
    const error = response;
    if (isExpectedError(error)) {
      return errorManager.handle(request, h, error);
    } else {
      monitoringTools.logError({ event: 'uncaught-error', stack: error.stack });
    }
  }

  return h.continue;
}

module.exports = {
  handleErrors,
};
