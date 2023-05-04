import { Serializer } from 'jsonapi-serializer';

const serialize = function (newEmail) {
  return new Serializer('email-verification-codes', {
    attributes: ['email'],
  }).serialize(newEmail);
};

export { serialize };
