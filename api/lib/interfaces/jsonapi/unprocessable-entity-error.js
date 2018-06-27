const JSONAPIError = require('jsonapi-serializer').Error;

module.exports = (errorMessage) => {
  return new JSONAPIError({
    status: '422',
    title: 'Unprocessable Entity Error',
    detail: errorMessage
  });
};
