const { Deserializer } = require('jsonapi-serializer');

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
});

module.exports = deserializer;
