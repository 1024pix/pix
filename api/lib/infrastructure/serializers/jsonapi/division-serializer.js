const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(divisions) {
    return new Serializer('divisions', {
      id: 'name',
      attributes: ['name'],
    }).serialize(divisions);
  },
};
