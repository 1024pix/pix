const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {
  serialize(trainingTrigger = {}, meta) {
    return new Serializer('training-triggers', {
      transform(record) {
        return JSON.parse(JSON.stringify(record));
      },
      attributes: ['id', 'trainingId', 'type', 'threshold', 'areas', 'tubesCount'],
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
            attributes: ['name', 'index', 'triggerTubes'],
            triggerTubes: {
              ref: 'id',
              included: true,
              attributes: ['id', 'level', 'tube'],
              tube: {
                ref: 'id',
                included: true,
                attributes: ['id', 'name', 'practicalTitle'],
              },
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
