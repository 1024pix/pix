const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(authenticationContent) {
    return new Serializer('user-oidc-authentication-requests', {
      attributes: [
        'fullNameFromPix',
        'fullNameFromExternalIdentityProvider',
        'email',
        'username',
        'authenticationMethods',
      ],
    }).serialize(authenticationContent);
  },
};
