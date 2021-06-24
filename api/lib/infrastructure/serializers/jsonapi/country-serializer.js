const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(country) {
    return new Serializer('country', {
      id: 'code',
      attributes: ['code', 'name'],
    }).serialize(country);
  },

};
