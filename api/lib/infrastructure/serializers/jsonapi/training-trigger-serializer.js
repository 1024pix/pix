import { Serializer, Deserializer } from 'jsonapi-serializer';

export default {
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
