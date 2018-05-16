const JSONAPIError = require('jsonapi-serializer').Error;

module.exports = {
  serialize(infrastructureError) {
    return JSONAPIError({
      code: `${infrastructureError.code}`,
      title: infrastructureError.title,
      detail: infrastructureError.message
    });
  }
};

