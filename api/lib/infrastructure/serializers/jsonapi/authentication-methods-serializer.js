const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(authenticationMethods) {
    return new Serializer('authentication-methods', {
      attributes: ['identityProvider'],
    }).serialize(authenticationMethods);
  },
};
