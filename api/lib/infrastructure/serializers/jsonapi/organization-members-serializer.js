const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(model) {
    return new Serializer('members', {
      id: 'id',
      attributes: ['firstName', 'lastName'],
    }).serialize(model);
  },
};
