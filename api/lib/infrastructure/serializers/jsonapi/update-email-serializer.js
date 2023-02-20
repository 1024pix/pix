import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(newEmail) {
    return new Serializer('email-verification-codes', {
      attributes: ['email'],
    }).serialize(newEmail);
  },
};
