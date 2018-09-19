const internalError = require('./internal-error');
const emptyDataResponse = require('./empty-data-response');
const forbiddenError = require('./forbidden-error');
const unprocessableEntityError = require('./unprocessable-entity-error');

module.exports = {
  internalError,
  emptyDataResponse,
  forbiddenError,
  unprocessableEntityError,
};
