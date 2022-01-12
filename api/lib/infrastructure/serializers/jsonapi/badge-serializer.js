const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(badge = {}) {
    return new Serializer('badge', {
      ref: 'id',
      attributes: ['altMessage', 'imageUrl', 'message', 'key', 'title', 'isCertifiable', 'isAlwaysVisible'],
    }).serialize(badge);
  },

  deserialize(json) {
    return {
      key: json.data.attributes['key'],
      altMessage: json.data.attributes['alt-message'],
      message: json.data.attributes['message'],
      title: json.data.attributes['title'],
    };
  },
};
