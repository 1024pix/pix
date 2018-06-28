const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(correction) {
    return new Serializer('corrections', {
      attributes: ['solution', 'hint', 'tutorials'],
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
        ]
      },
      transform: (record) => {
        const correction = Object.assign({}, record);
        correction.hint = typeof(record.relevantHint) !== 'undefined' ? record.relevantHint.value : null;
        return correction;
      }
    }).serialize(correction);
  }
};
