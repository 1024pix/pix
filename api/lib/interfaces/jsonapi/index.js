const emptyDataResponse = require('./empty-data-response');
const badRequest = require('./bad-request-error');
const forbiddenError = require('./forbidden-error');
const internalError = require('./internal-error');
const unprocessableEntityError = require('./unprocessable-entity-error');

module.exports = {
  emptyDataResponse,
  badRequest,
  forbiddenError,
  internalError,
  unprocessableEntityError,
};
