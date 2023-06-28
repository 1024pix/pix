import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

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
