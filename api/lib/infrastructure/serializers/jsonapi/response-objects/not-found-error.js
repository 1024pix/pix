const JSONAPIError = require('jsonapi-serializer').Error;

module.exports = (errorMessage) => {
  return new JSONAPIError({
    status: '404',
    title: 'Not Found',
    detail: errorMessage
  });
};
