const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {
  serialize(trainingTrigger = {}, meta) {
    return new Serializer('training-triggers', {
      transform(record) {
        return {
          ...record,
          triggerTubes: record.triggerTubes.map((triggerTube) => {
            return {
              ...triggerTube,
              tube: { ...triggerTube.tube },
            };
          }),
        };
      },
      attributes: ['id', 'trainingId', 'type', 'threshold', 'triggerTubes', 'areas'],
      triggerTubes: {
        ref: 'id',
        included: true,
        attributes: ['id', 'level', 'tube'],
        tube: {
          ref: 'id',
          attributes: ['id', 'name', 'practicalTitle'],
        },
      },
      areas: {
        ref: 'id',
        included: true,
        attributes: ['title', 'code', 'color', 'competences'],
        competences: {
          ref: 'id',
          included: true,
          attributes: ['name', 'index', 'thematics'],
          thematics: {
            ref: 'id',
            included: true,
            attributes: ['name', 'index', 'trainingTriggerTubes'],
            trainingTriggerTubes: {
              ref: 'id',
              included: true,
            },
          },
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
    }).serialize(trainingTrigger);
  },

  deserialize(payload) {
    return new Deserializer({
      keyForAttribute: 'camelCase',
    }).deserialize(payload);
  },
};
