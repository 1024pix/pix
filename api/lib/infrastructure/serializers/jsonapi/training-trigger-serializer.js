const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {
  serialize(training = {}, meta) {
    return new Serializer('training-triggers', {
      transform(training) {
        return {
          ...training,
          triggerTubes: training.triggerTubes.map((triggerTube) => {
            return {
              ...triggerTube,
              tube: { ...triggerTube.tube },
            };
          }),
        };
      },
      attributes: ['trainingId', 'type', 'threshold', 'triggerTubes'],
      triggerTubes: {
        ref: 'id',
        includes: true,
        attributes: ['id', 'level', 'tube'],
        tube: {
          ref: 'id',
          attributes: ['id', 'name', 'practicalTitle', 'practicalDescription', 'competences'],
        },
      },
      meta,
      typeForAttribute(attribute) {
        switch (attribute) {
          case 'triggerTubes':
            return 'trigger-tubes';
          case 'tube':
            return 'tubes';
          default:
            return attribute;
        }
      },
    }).serialize(training);
  },

  deserialize(payload) {
    return new Deserializer({
      keyForAttribute: 'camelCase',
    }).deserialize(payload);
  },
};
