const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(correction) {
    return new Serializer('corrections', {
      attributes: ['solution', 'hint'],
      transform: (record) => {
        const correction = Object.assign({}, record);
        correction.hint = typeof(record.relevantHint) !== 'undefined' ? record.relevantHint.value : null;
        return correction;
      }
    }).serialize(correction);
  }
};
