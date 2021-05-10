const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(tags) {
    return new Serializer('tags', {
      attributes: ['name'],
    }).serialize(tags);
  },

};
