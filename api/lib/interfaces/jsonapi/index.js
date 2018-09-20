const emptyDataResponse = require('./empty-data-response');
const forbiddenError = require('./forbidden-error');
const internalError = require('./internal-error');
const unprocessableEntityError = require('./unprocessable-entity-error');

module.exports = {
  emptyDataResponse,
  forbiddenError,
  internalError,
  unprocessableEntityError,
};
