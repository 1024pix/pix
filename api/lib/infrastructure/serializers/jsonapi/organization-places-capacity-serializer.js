const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(places) {
    return new Serializer('organization-places-capacity', {
      attributes: ['categories'],
    }).serialize(places);
  },
};
