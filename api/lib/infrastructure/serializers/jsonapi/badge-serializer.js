const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(badge = {}) {
    return new Serializer('badge', {
      ref: 'id',
      attributes: ['altMessage', 'imageUrl', 'message', 'key', 'title', 'isCertifiable', 'badgeCriteria'],
      badgeCriteria: {
        include: true,
        ref: 'id',
        attributes: ['threshold', 'scope'],
      },
      typeForAttribute: (attribute) => {
        if (attribute === 'badgeCriteria') return 'badge-criterion';
      },
    }).serialize(badge);
  },
};
