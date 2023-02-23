const get = require('lodash/get');
const { BadRequestError, sendJsonApiError } = require('./application/http-errors.js');

function handleFailAction(request, h, err) {
  const message = get(err, 'details[0].message', '');
  return sendJsonApiError(new BadRequestError(message), h);
}

module.exports = {
  handleFailAction,
};
