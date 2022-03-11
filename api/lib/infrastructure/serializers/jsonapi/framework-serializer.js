const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(frameworks) {
    return new Serializer('framework', {
      ref: 'id',
      attributes: ['name'],
    }).serialize(frameworks);
  },
};
