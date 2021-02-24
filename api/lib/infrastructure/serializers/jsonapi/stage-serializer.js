const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(badge = {}) {
    return new Serializer('stage', {
      ref: 'id',
      attributes: ['message', 'threshold', 'title'],
    }).serialize(badge);
  },
};
