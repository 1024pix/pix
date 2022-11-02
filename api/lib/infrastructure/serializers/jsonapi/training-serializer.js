const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {
  serialize(training = {}) {
    return new Serializer('trainings', {
      attributes: ['duration', 'link', 'locale', 'title', 'type'],
    }).serialize(training);
  },

  deserialize(payload) {
    return new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(payload);
  },
};
