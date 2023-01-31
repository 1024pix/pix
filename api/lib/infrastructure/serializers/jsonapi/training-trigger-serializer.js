const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {
  serialize(training = {}, meta) {
    return new Serializer('training-triggers', {
      attributes: ['trainingId', 'type', 'threshold', 'tubes'],
      tubes: {
        ref: 'id',
        includes: true,
        attributes: ['id', 'level'],
      },
      meta,
    }).serialize(training);
  },

  deserialize(payload) {
    return new Deserializer({
      keyForAttribute: 'camelCase',
    }).deserialize(payload);
  },
};
