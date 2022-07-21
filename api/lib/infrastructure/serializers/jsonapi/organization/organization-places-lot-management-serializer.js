const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(places) {
    return new Serializer('organization-place', {
      attributes: ['count', 'activationDate', 'expirationDate', 'reference', 'category', 'status', 'creatorFullName'],
    }).serialize(places);
  },
};
