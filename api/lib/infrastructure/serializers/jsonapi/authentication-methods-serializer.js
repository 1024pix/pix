import { Serializer } from 'jsonapi-serializer';

const serialize = function (authenticationMethods) {
  return new Serializer('authentication-methods', {
    attributes: ['identityProvider'],
  }).serialize(authenticationMethods);
};

export { serialize };
