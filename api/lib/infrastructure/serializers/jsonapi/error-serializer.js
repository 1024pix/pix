const JSONAPIError = require('jsonapi-serializer').Error;

module.exports = {
  serialize(infrastructureError) {
    return JSONAPIError({
      status: `${infrastructureError.status}`,
      title: infrastructureError.title,
      detail: infrastructureError.message
    });
  }
};
