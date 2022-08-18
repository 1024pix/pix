const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(authenticationContent) {
    return new Serializer('user-oidc-authentication-requests', {
      attributes: ['accessToken', 'logoutUrlUUID'],
    }).serialize(authenticationContent);
  },
};
