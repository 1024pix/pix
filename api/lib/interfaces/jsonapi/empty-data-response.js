const JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = () => {
  const object = new JSONAPISerializer('', {});
  return object.serialize(null);
};
