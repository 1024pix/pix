const JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = (type) => {
  const object = new JSONAPISerializer(type, {
    attributes: []
  });
  return object.serialize(null);
};
