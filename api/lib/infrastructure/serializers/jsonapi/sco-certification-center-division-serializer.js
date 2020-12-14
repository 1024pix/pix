const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(divisions, meta) {
    return new Serializer('divisions', {
      attributes: [
        'name',
      ],
      meta,
    }).serialize(divisions);
  },
};
