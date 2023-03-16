import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (newEmail) {
  return new Serializer('email-verification-codes', {
    attributes: ['email'],
  }).serialize(newEmail);
};

export { serialize };
