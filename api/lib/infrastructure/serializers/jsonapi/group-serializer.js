const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(groups) {
    return new Serializer('groups', {
      id: 'name',
      attributes: ['name'],
    }).serialize(groups);
  },
};
