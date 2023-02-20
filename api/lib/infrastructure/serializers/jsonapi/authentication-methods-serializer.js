import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(authenticationMethods) {
    return new Serializer('authentication-methods', {
      attributes: ['identityProvider'],
    }).serialize(authenticationMethods);
  },
};
