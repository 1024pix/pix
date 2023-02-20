import { Serializer } from 'jsonapi-serializer';

export default {
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
