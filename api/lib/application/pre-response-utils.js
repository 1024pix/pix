const config = require('../config');
const logger = require('../infrastructure/logger');
const errorManager = require('./error-manager');
const { BaseHttpError, UnauthorizedError } = require('./http-errors');
const { DomainError } = require('../domain/errors');
const CertificationSessionSchedulingDomainError = require('../certification-session-scheduling/domain/errors/DomainError').DomainError;

function handleDomainAndHttpErrors(request, h) {
  const response = request.response;

  if (
    response instanceof DomainError
    || response instanceof CertificationSessionSchedulingDomainError
    || response instanceof BaseHttpError) {
    return errorManager.handle(request, h, response);
  }

  // Ne devrait pas etre necessaire
  if (response.isBoom && response.output.statusCode === 401) {
    return errorManager.handle(request, h, new UnauthorizedError(undefined, 401));
  }

  if (_is5XXError(response) && config.logging.shouldLog5XXErrors) {
    logger.error(response);
  }

  return h.continue;
}

function _is5XXError(response) {
  return response.isBoom && response.output && response.output.statusCode >= 500;
}

module.exports = {
  handleDomainAndHttpErrors,
};
