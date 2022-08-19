const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(authenticationContent) {
    return new Serializer('user-oidc-authentication-requests', {
      attributes: [
        'accessToken',
        'logoutUrlUUID',
        'fullNameFromPix',
        'fullNameFromExternalIdentityProvider',
        'email',
        'username',
        'authenticationMethods',
      ],
    }).serialize(authenticationContent);
  },
};
