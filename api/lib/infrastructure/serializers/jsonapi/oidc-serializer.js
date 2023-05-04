import { Serializer } from 'jsonapi-serializer';

const serialize = function (authenticationContent) {
  return new Serializer('user-oidc-authentication-requests', {
    attributes: [
      'fullNameFromPix',
      'fullNameFromExternalIdentityProvider',
      'email',
      'username',
      'authenticationMethods',
    ],
  }).serialize(authenticationContent);
};

export { serialize };
