const JSONAPIError = require('jsonapi-serializer').Error;

module.exports = (errorMessage) => {
  return new JSONAPIError({
    status: '500',
    title: 'Internal Server Error',
    detail: errorMessage
  });
};
