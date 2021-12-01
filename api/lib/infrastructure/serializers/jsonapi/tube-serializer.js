const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(tube) {
    return new Serializer('tube', {
      ref: 'id',
      attributes: ['practicalTitle', 'practicalDescription', 'competenceId'],
    }).serialize(tube);
  },
};
