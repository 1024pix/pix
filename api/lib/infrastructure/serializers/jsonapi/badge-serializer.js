const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(badge = {}) {
    return new Serializer('badge', {
      ref: 'id',
      attributes: ['imageUrl', 'message'],
    }).serialize(badge);
  },
};
