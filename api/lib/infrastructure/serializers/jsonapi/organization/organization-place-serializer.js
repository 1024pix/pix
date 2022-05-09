const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(places) {
    return new Serializer('organization-place', {
      attributes: ['count', 'activationDate', 'expiredDate', 'reference', 'category', 'status', 'creatorFullName'],
    }).serialize(places);
  },
};
