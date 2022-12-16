const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(model) {
    return new Serializer('member-identity', {
      id: 'id',
      attributes: ['firstName', 'lastName'],
    }).serialize(model);
  },
};
