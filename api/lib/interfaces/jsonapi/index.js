const internalError = require('./internal-error');
const forbiddenError = require('./forbidden-error');
const unprocessableEntityError = require('./unprocessable-entity-error');

module.exports = {
  internalError,
  forbiddenError,
  unprocessableEntityError,
};
