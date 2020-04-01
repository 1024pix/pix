const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(correction) {
    const serialized = new Serializer('corrections', {
      attributes: ['solution', 'hint', 'tutorials', 'learningMoreTutorials'],
      tutorials: {
        ref: 'id',
        includes: true,
        attributes: [
          'id',
          'duration',
          'format',
          'link',
          'source',
          'title',
          'isSaved',
        ]
      },
      'learningMoreTutorials': {
        includes: true,
        ref: 'id',
        attributes: [
          'id',
          'duration',
          'format',
          'link',
          'source',
          'title',
          'isSaved',
        ],
      },
      typeForAttribute(attribute) {
        if (attribute === 'learningMoreTutorials') {
          return 'tutorials';
        } else {
          return attribute;
        }
      },
      transform: (record) => {
        const correction = Object.assign({}, record);
        correction.hint = typeof(record.relevantHint) !== 'undefined' ? record.relevantHint.value : null;
        return correction;
      }
    }).serialize(correction);

    return serialized;
  }
};
