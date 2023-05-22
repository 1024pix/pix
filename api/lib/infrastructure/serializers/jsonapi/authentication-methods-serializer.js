import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (authenticationMethods) {
  return new Serializer('authentication-methods', {
    attributes: ['identityProvider'],
  }).serialize(authenticationMethods);
};

export { serialize };
