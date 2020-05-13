const JSONAPIError = require('jsonapi-serializer').Error;

module.exports = (errorMessage) => {
  return new JSONAPIError({
    status: '400',
    title: 'Bad Request',
    detail: errorMessage
  });
};
