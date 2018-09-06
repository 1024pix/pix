const JSONAPIError = require('jsonapi-serializer').Error;

module.exports = (errorMessage) => {
  return new JSONAPIError({
    status: '401',
    title: 'Unauthorized',
    detail: errorMessage
  });
};
