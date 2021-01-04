const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(divisions) {
    return new Serializer('divisions', {
      transform: (division) => ({ name: division }),
      id: 'name',
      attributes: ['name'],
    }).serialize(divisions);
  },
};
