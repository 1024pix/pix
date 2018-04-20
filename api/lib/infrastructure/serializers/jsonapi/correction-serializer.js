const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(correction) {
    return new Serializer('corrections', {
      attributes: ['solution', 'hint'],
      transform: (record) => {
        const correction = Object.assign({}, record);
        correction.hint = record.relevantHint ? record.relevantHint.value : undefined;
        return correction;
      }
    }).serialize(correction);
  }
};
