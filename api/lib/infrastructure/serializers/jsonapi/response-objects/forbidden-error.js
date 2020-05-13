const JSONAPIError = require('jsonapi-serializer').Error;

module.exports = (errorMessage) => {
  return new JSONAPIError({
    status: '403',
    title: 'Forbidden Error',
    detail: errorMessage
  });
};
