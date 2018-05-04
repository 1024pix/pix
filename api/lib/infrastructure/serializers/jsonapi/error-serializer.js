const JSONAPIError = require('jsonapi-serializer').Error;

module.exports = {
  serialize(error) {
    return JSONAPIError({
      code: `${error.code}`,
      title: error.title,
      detail: error.message
    });
  }
};

